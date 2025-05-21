import { EntitySchema } from "typeorm";

export const Employee = new EntitySchema({
  name: "Employee",
  tableName: "employee",
  columns: {
    employee_id: {
      primary: true,
      type: "int",
      generated: true,
    },
    email: {
      type: "varchar",
      unique: true,
    },
    name: {
      type: "varchar",
    },
    designation: {
      type: "varchar",
      nullable: true,
    },
    department: {
      type: "varchar",
      nullable: true,
    },
    base_salary: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
    },
    max_approval_level: {
      type: "int",
      nullable: true,
    },
    role: {
      type: "varchar",
      nullable: true,
    },
    in_notice: {
      type: "boolean",
      default: false,
    },
    password: {
      type: "varchar",
      select: false,
    },
    phone_number: {
      type: "varchar",
      unique: true,
      nullable: true,
    },
  },
});
