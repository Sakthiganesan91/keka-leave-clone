import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import cookieParser from "cookie-parser";
import swaggerUI from "swagger-ui-express";

import { performLeaveRollover } from "./helper/rollOverMonthly.js";
import { performYearlyLeaveRollover } from "./helper/rollOverYearly.js";

import swaggerSpec from "./swaggerDoc.js";
import logger from "./config/logger.js";

import { routes as employeeRoutes } from "./routes/employee.route.js";
import { routes as leavePolicyRoutes } from "./routes/leavePolicy.route.js";
import { routes as leaveRequestRoutes } from "./routes/leaveRequest.route.js";
import { routes as authRoutes } from "./routes/authentication.route.js";

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/leave-policies", leavePolicyRoutes);
app.use("/leave-requests", leaveRequestRoutes);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// month
cron.schedule("5 0 1 * *", async () => {
  logger.info("Running monthly leave rollover task.");
  await performLeaveRollover();
  logger.info("Monthly leave rollover task completed.");
});

// year
cron.schedule("0 0 1 1 *", async () => {
  logger.info("Running yearly leave rollover task.");
  await performYearlyLeaveRollover();
  logger.info("Yearly leave rollover task completed.");
});

app.listen(process.env.PORT, () => {
  logger.info(`Server is running on port ${process.env.PORT}`);
});
