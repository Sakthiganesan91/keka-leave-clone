import { EntitySchema } from "typeorm";
import { Employee } from "./employee.model.js";
export const EmployeeSalary = new EntitySchema({
  name: "EmployeeSalary",
  tableName: "employee_salary",
  columns: {
    salary_id: {
      primary: true,
      type: "int",
      generated: true,
    },

    lop_deduction_per_day: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },

    allowances: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },

    performance_bonus: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },

    base_salary: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
  },
  relations: {
    employee: {
      type: "one-to-one",
      target: "Employee",
      joinColumn: {
        name: "employee_id",
      },
      nullable: false,
      onDelete: "CASCADE",
    },
  },
});
