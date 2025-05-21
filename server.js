import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import "reflect-metadata";
import logger from "./config/logger.js";
import {
  rolloverQueue,
  subClient,
  yearlyRolloverQueue,
} from "./config/redis.js";
import { getIO, initSocket } from "./config/socket.js";

import { routes as employeeRoutes } from "./routes/employee.route.js";
import { routes as leavePolicyRoutes } from "./routes/leavePolicy.route.js";
import { routes as leaveRequestRoutes } from "./routes/leaveRequest.route.js";
import { routes as authRoutes } from "./routes/authentication.route.js";
import { apiLimiter } from "./util/rate-limiter.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 4000;

const socketServer = createServer();
const io = new Server(socketServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});
initSocket(io, subClient);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/employees", apiLimiter, employeeRoutes);
app.use("/leave-policies", apiLimiter, leavePolicyRoutes);
app.use("/leave-requests", apiLimiter, leaveRequestRoutes);

app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});

socketServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO server is running on port ${SOCKET_PORT}`);
});

async function scheduleRollover() {
  try {
    const repeatableJobs = await rolloverQueue.getRepeatableJobs();
    const existingJob = repeatableJobs.find(
      (job) => job.name === "monthly-rollover"
    );

    if (existingJob) {
      logger.info("Monthly rollover job already scheduled, skipping.");
    } else {
      await rolloverQueue.add(
        "monthly-rollover",
        { timestamp: Date.now() },
        {
          repeat: { pattern: "0 0 1 * *" },
          removeOnComplete: true,
          removeOnFail: 1000,
        }
      );
      logger.info("Monthly rollover job scheduled successfully");
    }
  } catch (error) {
    logger.error(`Failed to schedule monthly rollover job: ${error.message}`);
  }
}

async function scheduleYearlyRollover() {
  try {
    const repeatableJobs = await yearlyRolloverQueue.getRepeatableJobs();
    const existingJob = repeatableJobs.find(
      (job) => job.name === "yearly-rollover"
    );

    if (existingJob) {
      logger.info("Yearly rollover job already scheduled, skipping.");
    } else {
      await yearlyRolloverQueue.add(
        "yearly-rollover",
        { timestamp: Date.now() },
        {
          repeat: { pattern: "0 0 1 1 *" },
          removeOnComplete: true,
          removeOnFail: 1000,
        }
      );
      logger.info("Yearly rollover job scheduled successfully");
    }
  } catch (error) {
    logger.error(`Failed to schedule yearly rollover job: ${error.message}`);
  }
}

Promise.all([
  scheduleRollover().catch((err) =>
    logger.error(`Error scheduling monthly rollover: ${err.message}`)
  ),
  scheduleYearlyRollover().catch((err) =>
    logger.error(`Error scheduling yearly rollover: ${err.message}`)
  ),
]);
