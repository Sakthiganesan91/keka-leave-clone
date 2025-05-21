import { Worker } from "bullmq";
import IORedis from "ioredis";
import { performLeaveRollover } from "../helper/rollOverMonthly.js";

export const redisConnection = new IORedis({
  host: "redis-19270.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 19270,
  username: "default",
  password: "FlVRaChj2Q4Q2GpcZbwBvpRG5oiuH3Kn",
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "rollover-queue",
  async (job) => {
    console.log(`Processing job ${job.name}`);

    try {
      await performLeaveRollover();
      console.log(`Job ${job.name} completed successfully`);
    } catch (error) {
      console.error(`Error performing rollover: ${error.message}`);
      throw error;
    }
  },
  { connection: redisConnection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

const yearlyWorker = new Worker(
  "yearly-rollover-queue",
  async (job) => {
    console.log(`Processing yearly rollover job ${job.name}`);

    try {
      await performYearlyLeaveRollover();
      console.log(`Yearly rollover job ${job.name} completed successfully`);
    } catch (error) {
      console.error(`Error performing yearly rollover: ${error.message}`);
      throw error; // Rethrow to trigger the failed event
    }
  },
  { connection: redisConnection }
);

yearlyWorker.on("completed", (job) => {
  console.log(`Yearly rollover job ${job.id} completed`);
});

yearlyWorker.on("failed", (job, err) => {
  console.error(`Yearly rollover job ${job.id} failed: ${err.message}`);
});
