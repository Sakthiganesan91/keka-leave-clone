import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";

import { performLeaveRollover } from "./helper/rollOverMonthly.js";
import { performYearlyLeaveRollover } from "./helper/rollOverYearly.js";

import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./swaggerDoc.js";

import { routes as employeeRoutes } from "./routes/employee.route.js";
import { routes as leavePloicyRoutes } from "./routes/leavePolicy.route.js";
import { routes as leaveRequestRoutes } from "./routes/leaveRequest.route.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/employees", employeeRoutes);
app.use("/leave-policies", leavePloicyRoutes);
app.use("/leave-requests", leaveRequestRoutes);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// month
cron.schedule("5 0 1 * *", async () => {
  await performLeaveRollover();
});

// year
cron.schedule("0 0 1 1 *", async () => {
  await performYearlyLeaveRollover();
});

app.listen(5000);
