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
    phone_number,
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
      "INSERT INTO employee (email, name, designation, department, base_salary, max_approval_level, role, in_notice,password,phone_number) VALUES (?, ?, ?, ?,?, ?, ?, ?, ?, ?)",
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
        phone_number,
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
      `SELECT ELY.leave_remaining,ELY.leave_taken,ELY.leave_allocated,L.leave_type_name FROM employee_leave_yearly ELY JOIN leavepolicy L on L.leavepolicy_id = ELY.leavepolicy_id WHERE  ELY.leavepolicy_id = ? AND ELY.employee_id = ? AND ELY.year = ?`,
      [leavepolicy_id, employee_id, year]
    );
    console.log(leaveRemainingResult);
    if (leaveRemainingResult.length === 0) {
      logger.info("No leave taken for the particular year");
      return res.status(201).json({
        leaveRemaining: [],
        message: "No Leave Taken for the particular year",
      });
    }
    const leaveRemaining = leaveRemainingResult;
    logger.info("Leave remaining for employee", {
      employee_id,
      leaveRemaining,
    });
    res.status(200).json({
      leaveRemaining: leaveRemaining[0],
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
      `
        SELECT 
  lr.leave_id,
  lr.leavepolicy_id,
  lr.start_date,
  lr.end_date,
  lr.noofdays,
  lr.leave_reason,
  lr.cancellation_comment,
  lr.cancelled_by,
  lr.approver_id,
  approver.name AS manager_name,
  lr.status,
  lr.status_updated_at,
  lr.applied_on,
  lr.leave_type,
  lr.current_level,
  requester.name AS requested_name
FROM leave_request lr
JOIN employee approver ON lr.approver_id = approver.employee_id
JOIN employee requester ON lr.employee_id = requester.employee_id
WHERE lr.employee_id = ? AND lr.status = ?

      `,
      [employee_id, status]
    );

    if (leaveResults.length === 0) {
      logger.info("No leaves found for the given status and employee");
      return res
        .status(200)
        .json({ message: "No leaves found for the given status", leaves: [] });
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
      `SELECT L.*,E.* FROM leave_request L join employee E on L.employee_id=? WHERE E.employee_id = ?`,
      [employee_id, employee_id]
    );

    if (leaveResults.length === 0) {
      logger.info("No leaves found for the given employee");
      return res.status(200).json({
        success: true,
        message: "No leaves found for the given employee",
        leaves: [],
      });
    }
    logger.info("Leaves found for employee", { employee_id });
    res.status(200).json({
      success: true,
      leaves: leaveResults,
      message: "Leaves fetched Successfully",
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

const organizeLeaveData = (leaves) => {
  const leaveData = leaves.map((l) => ({
    id: l.leave_id,
    title: `${l.leave_type} Leave - ${l.name}`,
    start: l.start_date,
    end: l.end_date,
    type: l.leave_type.toLowerCase(),
    isHalfDay: !!l.is_half_day,
    status: l.status,
    reason: l.leave_reason,
    employee: {
      id: l.employee_id,
      name: l.name,
      role: l.role,
      email: l.email,
      department: l.department,
      designation: l.designation,
    },
  }));
  return leaveData;
};

export const getTeamLeaves = async (req, res) => {
  try {
    const { employeeIdSearch } = req.query;
    console.log(employeeIdSearch);

    let managerQuery = `
    SELECT L.*, E.name, E.role,E.employee_id,E.email,E.department ,E.designation FROM leave_request L
JOIN employee E ON L.employee_id = E.employee_id
WHERE E.manager_id = ?
    `;
    let employeeQuery = `
    SELECT L.*, E.name,E.designation, E.role,E.employee_id,E.email,E.department,E.manager_id FROM leave_request L
JOIN employee E ON L.employee_id = E.employee_id
WHERE E.manager_id = (SELECT manager_id FROM employee WHERE employee_id = ?)
    `;

    if (employeeIdSearch && parseInt(employeeIdSearch) !== 0) {
      let search = ` AND E.employee_id = ${parseInt(employeeIdSearch)}`;
      managerQuery += search;
      employeeQuery += search;
    }

    if (!req.user) {
      throw Error("User not found");
    }
    const employee_id = req.user.employee_id;
    const role = req.user.role;

    if (!employee_id || !role) throw Error("Access Not Allowed");

    if (role === "manager") {
      const [leave_results] = await connection.query(managerQuery, [
        employee_id,
      ]);
      if (leave_results.length === 0) {
        return res.status(200).json({
          leaveData: [],
        });
      }
      const leaveData = organizeLeaveData(leave_results);
      return res.status(200).json({
        leaveData,
      });
    }
    if (role === "employee") {
      const [leave_results] = await connection.query(employeeQuery, [
        employee_id,
      ]);

      if (leave_results.length === 0) {
        return res.status(200).json({
          leaveData: [],
        });
      }
      const leaveData = organizeLeaveData(leave_results);

      return res.status(200).json({
        leaveData,
      });
    }

    return res.status(200).json({
      leaveData: [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const getTeamEmployees = async (req, res) => {
  try {
    const { search, role: searchRole, department } = req.query;
    console.log(req.query);

    let managerSearchQuery = ` SELECT  name, role,employee_id,email,department ,designation FROM employee 
    WHERE manager_id = ?`;
    let employeeSearchQuery = `   SELECT  name,designation, role,employee_id,email,department,manager_id FROM employee
    WHERE manager_id = (SELECT manager_id FROM employee WHERE employee_id = ?)`;

    if (search) {
      managerSearchQuery = managerSearchQuery + ` AND name LIKE '%${search}%'`;
      employeeSearchQuery =
        employeeSearchQuery + ` AND name LIKE '%${search}%'`;
    }
    if (searchRole && searchRole !== "all") {
      managerSearchQuery += ` AND role='${searchRole}'`;
      employeeSearchQuery += ` AND role='${searchRole}'`;
    }
    if (department && department !== "all") {
      managerSearchQuery += ` AND department='${department}'`;
      employeeSearchQuery += ` AND department='${department}'`;
    }
    if (!req.user) {
      throw Error("User not found");
    }
    const employee_id = req.user.employee_id;
    const role = req.user.role;

    if (!employee_id || !role) throw Error("Access Not Allowed");

    if (role === "manager") {
      const [employee_results] = await connection.query(managerSearchQuery, [
        employee_id,
      ]);

      return res.status(200).json({
        employee_results,
      });
    }
    if (role === "employee") {
      const [employee_results] = await connection.query(employeeSearchQuery, [
        employee_id,
      ]);

      return res.status(200).json({
        employee_results,
      });
    }

    return res.status(200).json({
      employee_results: [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const getRoles = async (req, res) => {
  try {
    const [role_results] = await connection.query(`
    SELECT DISTINCT(role) FROM employee;
    `);
    console.log(role_results);

    res.status(200).json({
      roles: role_results,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const [department_results] = await connection.query(`
    SELECT DISTINCT(department) FROM employee;
    `);

    res.status(200).json({
      departments: department_results,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getLeavesByEmployeeByMonth = async (req, res) => {
  const { employee_id } = req.params;

  const { year } = req.query;

  logger.info("Getting remaining leaves for employee", {
    employee_id,
    year,
  });
  if (!employee_id || !year) {
    throw new Error("Required Parameters Missing");
  }
  try {
    const [leaveRemainingResult] = await connection.query(
      ` select sum(leave_taken_month) as Leave_Taken,month from employee_leave where employee_id = ? and year = ? group by month;`,
      [employee_id, year]
    );
    console.log(leaveRemainingResult);
    if (leaveRemainingResult.length === 0) {
      logger.info("No leave taken for the particular year");
      return res.status(201).json({
        leaveRemaining: [],
        message: "No Leave Taken for the particular year",
      });
    }
    const leaveRemaining = leaveRemainingResult;
    logger.info("Leave remaining for employee", {
      employee_id,
      leaveRemaining,
    });
    res.status(200).json({
      leaveRemaining: leaveRemaining,
    });
  } catch (error) {
    logger.error("Error getting remaining leaves:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
};
