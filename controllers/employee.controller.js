import { query as connection } from "../database.js";

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
  } = req.body;

  if (!email || !name || !designation || !department || !basic_salary) {
    return res.status(400).json({ message: "Required fields are missing" });
  }
  try {
    const [results] = await connection.query(
      "INSERT INTO employee (email, name, designation, department, base_salary, max_approval_level, role, in_notice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        email,
        name,
        designation,
        department,
        basic_salary,
        max_approval_level,
        role,
        in_notice || 0,
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
    } else {
      return res.status(500).json({ message: "Failed to add employee" });
    }
    res.status(201).json({
      message: "Employee added successfully",
      employee_id: results.insertId,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const setManager = async (req, res) => {
  const { employeeEmail, managerEmail } = req.query;

  if (!employeeEmail || !managerEmail) {
    return res.status(400).json({ message: "Required Parameters are missing" });
  }
  try {
    const [manager_results] = await connection.query(
      "SELECT employee_id,role FROM employee WHERE email = ?",
      [managerEmail]
    );
    console.log(manager_results[0].role);
    if (
      manager_results.length === 0 ||
      (manager_results[0].role !== "manager" &&
        manager_results[0].role !== "hr")
    ) {
      return res
        .status(404)
        .json({ message: "Manager not found or Invalid role for assignment" });
    }

    const id = manager_results[0].employee_id;

    const [results] = await connection.query(
      "UPDATE employee  SET manager_id = ? WHERE email = ? ",
      [id, employeeEmail]
    );

    res.status(201).json({
      results,
    });
  } catch (error) {
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

  if (!employee_id) {
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
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(204).json({
      message: "Employee updated successfully",
    });
  } catch (error) {
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
    throw new Error("Employee id is required");
  }

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
      throw new Error("Failed to create employee payroll settings");
    }
  } catch (error) {
    throw new Error(
      "Error creating employee payroll settings: " + error.message
    );
  }
};

export const getRemainingLeavesByEmployee = async (req, res) => {
  const { employee_id } = req.params;

  const { leavepolicy_id, year } = req.query;

  if (!employee_id || !leavepolicy_id || !year) {
    throw new Error("Required Parameters Missing");
  }
  try {
    const [leaveRemainingResult] = await connection.query(
      `SELECT leave_remaining FROM employee_leave_yearly WHERE  leavepolicy_id = ? AND employee_id = ? AND year = ?`,
      [leavepolicy_id, employee_id, year]
    );

    if (leaveRemainingResult.length === 0) {
      return res.status(201).json({
        message: "No Leave Taken for the particular year",
      });
    }
    const leaveRemaining = leaveRemainingResult[0].leave_remaining;

    res.status(200).json({
      leaveRemaining,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getLeavesByStatusAndEmployee = async (req, res) => {
  const { employee_id, status } = req.query;
  try {
    if (!employee_id || !status) {
      throw new Error("Required Parameters Missing");
    }

    await getEmployeeById(employee_id);

    const [leaveResults] = await connection.query(
      `SELECT * FROM leave_request WHERE employee_id = ? AND STATUS = ?`,
      [employee_id, status]
    );

    if (leaveResults.length === 0) {
      return res
        .status(200)
        .json({ message: "No leaves found for the given status" });
    }

    res.status(200).json({
      leaves: leaveResults,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getLeavesByEmployeeId = async (req, res) => {
  const { employee_id } = req.params;
  try {
    if (!employee_id) {
      throw new Error("Required Parameters Missing");
    }

    await getEmployeeById(employee_id);

    const [leaveResults] = await connection.query(
      `SELECT * FROM leave_request WHERE employee_id = ?`,
      [employee_id]
    );

    if (leaveResults.length === 0) {
      return res
        .status(200)
        .json({ message: "No leaves found for the given employee" });
    }

    res.status(200).json({
      leaves: leaveResults,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
