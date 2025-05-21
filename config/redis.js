import { Queue } from "bullmq";
import IORedis from "ioredis";

export const redisConnection = new IORedis({
  host: "redis-19270.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 19270,
  username: "default",
  password: "FlVRaChj2Q4Q2GpcZbwBvpRG5oiuH3Kn",
  maxRetriesPerRequest: null,
});

export const rolloverQueue = new Queue("rollover-queue", {
  connection: redisConnection,
});

export const yearlyRolloverQueue = new Queue("yearly-rollover-queue", {
  connection: redisConnection,
});

export const addemployeeQueue = new Queue("employee-import", {
  connection: redisConnection,
});

export const pubClient = new IORedis({
  host: "redis-19270.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 19270,
  username: "default",
  password: "FlVRaChj2Q4Q2GpcZbwBvpRG5oiuH3Kn",
  maxRetriesPerRequest: null,
});
export const subClient = new IORedis({
  host: "redis-19270.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 19270,
  username: "default",
  password: "FlVRaChj2Q4Q2GpcZbwBvpRG5oiuH3Kn",
  maxRetriesPerRequest: null,
});
