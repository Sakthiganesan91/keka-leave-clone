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

const generateHashedPassword = (password) =>
  bcrypt.genSalt(10).then((salt) => bcrypt.hash(password, salt));

export const redisConnection = new IORedis({
  host: "redis-19270.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 19270,
  username: "default",
  password: "FlVRaChj2Q4Q2GpcZbwBvpRG5oiuH3Kn",
  maxRetriesPerRequest: null,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseEmployeesFromWorksheet = async (worksheet) => {
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

    if (!email) continue;
    try {
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
    } catch (error) {
      logger.error("Password hash error", error);
    }
  }
  return employees;
};

const uploadWorker = new Worker(
  "employee-import",
  async (job) => {
    const { filePath, uploadedBy } = job.data;
    logger.info(`Processing job ${job.id} for file: ${filePath}`);

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];

      const employees = await parseEmployeesFromWorksheet(worksheet);

      if (!AppDataSource.isInitialized) await AppDataSource.initialize();

      logger.info(`Inserting ${employees.length} employees...`);
      if (employees.length === 0) throw new Error("No employees to insert");

      await delay(5000);

      const result = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Employee)
        .values(employees)
        .execute();

      if (result.identifiers?.length) {
        const salaries = employees.map((employee, idx) => ({
          base_salary: employee.base_salary,
          employee: { employee_id: result.identifiers[idx].employee_id },
          allowances: employee.allowances,
          lop_deduction_per_day: employee.lop_deduction_per_day,
          performance_bonus: employee.performance_bonus,
        }));

        await AppDataSource.createQueryBuilder()
          .insert()
          .into(EmployeeSalary)
          .values(salaries)
          .execute();
      }

      fs.unlink(filePath, (err) => {
        if (err) logger.error("Failed to delete file:", err);
        else logger.info("Temp file deleted:", filePath);
      });

      return { status: "success", count: employees.length };
    } catch (error) {
      logger.error("Worker error:", error);
      throw new Error("Failed to process employee import.");
    }
  },
  { connection: redisConnection }
);

uploadWorker.on("completed", async (job) => {
  try {
    await pubClient.publish(
      "employeeUpload",
      JSON.stringify({
        uploadedBy: job.data.uploadedBy,
        message: "Employee data uploaded successfully",
      })
    );
  } catch {}
});

uploadWorker.on("failed", async (job, error) => {
  logger.error(`Job ${job.id} failed: ${error.message}`);
  await pubClient.publish(
    "employeeUpload",
    JSON.stringify({
      uploadedBy: job.data.uploadedBy,
      message: error.message,
    })
  );
});
