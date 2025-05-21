import fs from "fs";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { AppDataSource } from "./config/typeorm.js";
import { Employee } from "./models/employee.model.js";
import { EmployeeSalary } from "./models/employeeSalary.model.js";

import logger from "./config/logger.js";
import { pubClient } from "./config/redis.js";

const generateHashedPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error) {
    throw error;
  }
};

export const redisConnection = new IORedis({
  host: "redis-19270.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 19270,
  username: "default",
  password: "FlVRaChj2Q4Q2GpcZbwBvpRG5oiuH3Kn",
  maxRetriesPerRequest: null,
});

const uploadWorker = new Worker(
  "employee-import",
  async (job) => {
    const { filePath, uploadedBy } = job.data;
    console.log(`Processing job ${job.id} for file: ${filePath}`);

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];

      const employees = [];

      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const [
          name,
          email,
          designation,
          department,
          base_salary,
          max_approval_level,
          role,
          in_notice,
          password,
          phone_number,
          allowances,
          performance_bonus,
          lop_deduction_per_day,
        ] = row.values.slice(1);

        if (!email) return;
        const hashedPassword = await generateHashedPassword(password);
        employees.push({
          email,
          name,
          designation,
          department,
          base_salary,
          max_approval_level,
          role,
          in_notice,
          password: hashedPassword,
          phone_number,
          lop_deduction_per_day,
          allowances,
          performance_bonus,
        });
      }

      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }

      console.log(employees);

      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      await Promise.resolve().then(() => delay(5000));

      logger.info(`Inserting ${employees.length} employees...`);

      if (employees.length === 0) {
        throw Error("Retry Again");
      }
      const result = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Employee)
        .values(employees)
        .execute();

      if (result.identifiers && result.identifiers.length > 0) {
        const salaries = employees.map((employee, index) => {
          return {
            base_salary: employee.base_salary,
            employee: { employee_id: result.identifiers[index].employee_id },
            allowances: employee.allowances,
            lop_deduction_per_day: employee.lop_deduction_per_day,
            performance_bonus: employee.performance_bonus,
          };
        });

        await AppDataSource.createQueryBuilder()
          .insert()
          .into(EmployeeSalary)
          .values(salaries)
          .execute();
      }

      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err);
        else console.log("Temp file deleted:", filePath);
      });

      return { status: "success", count: employees.length };
    } catch (error) {
      console.error("Worker error:", error);
      throw new Error("Failed to process employee import.");
    }
  },
  { connection: redisConnection }
);

uploadWorker.on("completed", async (job) => {
  const uploadedBy = job.data.uploadedBy;
  console.log(`Job ${job.id} completed. Notifying uploadedBy: ${uploadedBy}`);

  try {
    await pubClient.publish(
      "employeeUpload",
      JSON.stringify({
        uploadedBy: job.data.uploadedBy,
        message: "Employee data uploaded successfully",
      })
    );
  } catch (error) {}
});

uploadWorker.on("failed", async (job, error) => {
  console.error(`Job ${job.id} failed: ${error.message}`);
  await pubClient.publish(
    "employeeUpload",
    JSON.stringify({
      uploadedBy: job.data.uploadedBy,
      message: error.message,
    })
  );
});
