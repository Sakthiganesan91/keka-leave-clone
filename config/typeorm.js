// typeormDataSource.ts
import { DataSource } from "typeorm";
import { Employee } from "../models/employee.model.js";
import { EmployeeSalary } from "../models/employeeSalary.model.js";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "Sakthi@25",
  database: "leaveapp",
  entities: [Employee, EmployeeSalary],
  synchronize: false,
});
