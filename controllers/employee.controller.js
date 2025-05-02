import { query as connection } from "../config/database.js";
import logger from "../config/logger.js";
import bcrypt from "bcryptjs";

const getEmployeeById = async (employee_id) => {
  try {
    const [results] = await connection.query(
      "SELECT * FROM employee WHERE employee_id = ?",
      [employee_id]
    );

    if (results.length === 0) {
      throw new Error("Employee not found");
    }

    return results[0];
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addEmployee = async (req, res) => {
  const {
    email,
    name,
    designation,
    department,
    basic_salary,
    max_approval_level,
    role,
    in_notice,
    lop_deduction,
    performance_bonus,
    allowances,
    password,
  } = req.body;
  logger.info("Adding employee", req.body);
  if (
    !email ||
    !name ||
    !designation ||
    !department ||
    !basic_salary ||
    !password
  ) {
    return res.status(400).json({ message: "Required fields are missing" });
  }
  try {
    const [existingEmployee] = await connection.query(
      "SELECT * FROM employee WHERE email = ?",
      [email]
    );
    if (existingEmployee.length > 0) {
      logger.error("Employee with this email already exists");
      return res
        .status(400)
        .json({ message: "Employee with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [results] = await connection.query(
      "INSERT INTO employee (email, name, designation, department, base_salary, max_approval_level, role, in_notice,password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        email,
        name,
        designation,
        department,
        basic_salary,
        max_approval_level,
        role,
        in_notice || 0,
        hashedPassword,
      ]
    );

    if (results.affectedRows === 1 && results.insertId) {
      await createEmployeePayroll(
        results.insertId,
        basic_salary,
        lop_deduction,
        allowances,
        performance_bonus
      );
      logger.info(
        `Employee payroll created for employee_id: ${results.insertId}`
      );
    } else {
      logger.error("Failed to create Employee");
      return res.status(500).json({ message: "Failed to add employee" });
    }

    logger.info("Employee added successfully", {
      employee_id: results.insertId,
    });
    res.status(201).json({
      message: "Employee added successfully",
      employee_id: results.insertId,
      token,
    });
  } catch (error) {
    logger.error("Error adding employee:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};

export const setManager = async (req, res) => {
  const { employeeEmail, managerEmail } = req.query;
  logger.info("Setting manager for employee", req.query);
  if (!employeeEmail || !managerEmail) {
    return res.status(400).json({ message: "Required Parameters are missing" });
  }
  try {
    const [manager_results] = await connection.query(
      "SELECT employee_id,role FROM employee WHERE email = ?",
      [managerEmail]
    );

    if (
      manager_results.length === 0 ||
      (manager_results[0].role !== "manager" &&
        manager_results[0].role !== "hr")
    ) {
      logger.error("Manager not found or Invalid role for assignment");
      return res
        .status(404)
        .json({ message: "Manager not found or Invalid role for assignment" });
    }

    const id = manager_results[0].employee_id;

    const [results] = await connection.query(
      "UPDATE employee  SET manager_id = ? WHERE email = ? ",
      [id, employeeEmail]
    );
    logger.info("Manager assigned successfully", {
      employeeEmail,
      managerEmail,
    });
    res.status(201).json({
      results,
    });
  } catch (error) {
    logger.error("Error setting manager:", error.message);
    res.status(500).json({
      error,
    });
  }
};

export const updateEmployee = async (req, res) => {
  const {
    name,
    designation,
    department,
    basic_salary,
    max_approval_level,
    role,
    in_notice,
  } = req.body;

  const { employee_id } = req.params;
  logger.info("Updating employee", {
    body: req.body,
    employee_id,
  });
  if (!employee_id) {
    logger.error("Employee ID is required to update employee");
    return res.status(400).json({ message: "Employee ID is required" });
  }
  if (
    !name ||
    !designation ||
    !department ||
    !basic_salary ||
    !max_approval_level ||
    !role ||
    in_notice === undefined
  ) {
    logger.error("Required fields are missing for employee update");
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const [results] = await connection.query(
      `UPDATE employee 
       SET name = ?, 
           designation = ?, 
           department = ?, 
           base_salary = ?, 
           max_approval_level = ?, 
           role = ?, 
           in_notice = ? 
       WHERE employee_id = ?`,
      [
        name,
        designation,
        department,
        basic_salary,
        max_approval_level,
        role,
        in_notice,
        employee_id,
      ]
    );

    if (results.affectedRows === 0) {
      logger.error("Employee not found for update");
      return res.status(404).json({ message: "Employee not found" });
    }
    logger.info("Employee updated successfully", {
      employee_id,
    });
    res.status(204).json({
      message: "Employee updated successfully",
    });
  } catch (error) {
    logger.error("Error updating employee:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};
const createEmployeePayroll = async (
  employee_id,
  base_salary,
  performance_bonus,
  allowances,
  lop_deduction_per_day
) => {
  if (!employee_id) {
    logger.error("Employee ID is required to create payroll settings");
    throw new Error("Employee id is required");
  }

  logger.info("Creating employee payroll", {
    employee_id,
    base_salary,
    performance_bonus,
    allowances,
    lop_deduction_per_day,
  });

  try {
    const [insert_results] = await connection.query(
      `
      INSERT INTO employee_salary (employee_id, base_salary, lop_deduction_per_day, performance_bonus, allowances)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        employee_id,
        base_salary,
        lop_deduction_per_day,
        performance_bonus,
        allowances,
      ]
    );

    if (insert_results.affectedRows === 0) {
      logger.error("Failed to create employee payroll settings");
      throw new Error("Failed to create employee payroll settings");
    }
  } catch (error) {
    logger.error("Error creating employee payroll settings:", error.message);
    throw new Error(
      "Error creating employee payroll settings: " + error.message
    );
  }
};

export const getRemainingLeavesByEmployee = async (req, res) => {
  const { employee_id } = req.params;

  const { leavepolicy_id, year } = req.query;
  logger.info("Getting remaining leaves for employee", {
    employee_id,
    leavepolicy_id,
    year,
  });
  if (!employee_id || !leavepolicy_id || !year) {
    throw new Error("Required Parameters Missing");
  }
  try {
    const [leaveRemainingResult] = await connection.query(
      `SELECT leave_remaining FROM employee_leave_yearly WHERE  leavepolicy_id = ? AND employee_id = ? AND year = ?`,
      [leavepolicy_id, employee_id, year]
    );

    if (leaveRemainingResult.length === 0) {
      logger.info("No leave taken for the particular year");
      return res.status(201).json({
        message: "No Leave Taken for the particular year",
      });
    }
    const leaveRemaining = leaveRemainingResult[0].leave_remaining;
    logger.info("Leave remaining for employee", {
      employee_id,
      leaveRemaining,
    });
    res.status(200).json({
      leaveRemaining,
    });
  } catch (error) {
    logger.error("Error getting remaining leaves:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getLeavesByStatusAndEmployee = async (req, res) => {
  const { employee_id, status } = req.query;
  logger.info("Getting leaves by status and employee", {
    employee_id,
    status,
  });
  try {
    if (!employee_id || !status) {
      throw new Error("Required Parameters Missing");
    }

    await getEmployeeById(employee_id);
    logger.info("Employee found", { employee_id });
    const [leaveResults] = await connection.query(
      `SELECT * FROM leave_request WHERE employee_id = ? AND STATUS = ?`,
      [employee_id, status]
    );

    if (leaveResults.length === 0) {
      logger.info("No leaves found for the given status and employee");
      return res
        .status(200)
        .json({ message: "No leaves found for the given status" });
    }

    res.status(200).json({
      leaves: leaveResults,
    });
  } catch (error) {
    logger.error("Error getting leaves by status and employee:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getLeavesByEmployeeId = async (req, res) => {
  const { employee_id } = req.params;
  logger.info("Getting leaves by employee ID", { employee_id });
  try {
    if (!employee_id) {
      throw new Error("Required Parameters Missing");
    }

    await getEmployeeById(employee_id);
    logger.info("Employee found", { employee_id });

    const [leaveResults] = await connection.query(
      `SELECT * FROM leave_request WHERE employee_id = ?`,
      [employee_id]
    );

    if (leaveResults.length === 0) {
      logger.info("No leaves found for the given employee");
      return res
        .status(200)
        .json({ message: "No leaves found for the given employee" });
    }
    logger.info("Leaves found for employee", { employee_id });
    res.status(200).json({
      leaves: leaveResults,
    });
  } catch (error) {
    logger.error("Error getting leaves by employee ID:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};

export const updateEmployeeStatus = async (req, res) => {
  const { status } = req.body;
  const employee_id = req.params.employee_id;
  logger.info("Updating employee status", {
    employee_id,
    status,
  });
  try {
    if (!status) {
      logger.error("Status is required to update employee status");
      return res.status(400).json({ message: "Status is required" });
    }
    if (!employee_id) {
      logger.error("Employee ID is required to update status");
      return res.status(400).json({ message: "Employee ID is required" });
    }
    if (status !== "active" && status !== "inactive") {
      logger.error("Invalid status provided for employee update");
      return res.status(400).json({ message: "Invalid status" });
    }

    await connection.query(
      `UPDATE employee SET status = ? WHERE employee_id = ?`,
      [status, employee_id]
    );
    logger.info("Employee status updated successfully", {
      employee_id,
      status,
    });
    res.status(200).json({ message: "Employee status updated successfully" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
