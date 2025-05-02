import { query as connection } from "../database.js";

export const addLeavePolicy = async (req, res) => {
  try {
    const {
      leave_type_name,
      need_approval,
      allow_half_day,
      max_days_per_year,
      paid,
      deduct_salary,
      approval_level_needed,
      max_days_per_month,
      not_approved_leave,
      roll_over_allowed,
      roll_over_count,
      roll_over_monthly_allowed,
    } = req.body;

    if (
      leave_type_name == null ||
      need_approval == null ||
      allow_half_day == null ||
      paid == null ||
      deduct_salary == null ||
      approval_level_needed == null ||
      roll_over_allowed == null ||
      roll_over_count == null ||
      roll_over_monthly_allowed == null
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const [result] = await connection.query(
      `INSERT INTO leavepolicy 
       (leave_type_name, need_approval, allow_half_day, max_days_per_year, paid, deduct_salary, approval_level_needed, max_days_per_month, not_approved_leave, roll_over_allowed, roll_over_count, roll_over_monthly_allowed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [
        leave_type_name,
        need_approval,
        allow_half_day,
        max_days_per_year,
        paid,
        deduct_salary,
        approval_level_needed,
        max_days_per_month,
        JSON.stringify(not_approved_leave),
        roll_over_allowed,
        roll_over_count,
        roll_over_monthly_allowed,
      ]
    );

    res.status(201).json({
      message: "Leave policy added successfully",
      policy_id: result.insertId,
    });
  } catch (error) {
    console.error("Error adding leave policy:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateLeavePolicy = async (req, res) => {
  try {
    const {
      leave_type_name,
      need_approval,
      allow_half_day,
      max_days_per_year,
      paid,
      deduct_salary,
      approval_level_needed,
      max_days_per_month,
      not_approved_leave,
      roll_over_allowed,
      roll_over_count,

      roll_over_monthly_allowed,
    } = req.body;

    if (
      leave_type_name == null ||
      need_approval == null ||
      allow_half_day == null ||
      paid == null ||
      deduct_salary == null ||
      approval_level_needed == null ||
      roll_over_allowed == null ||
      roll_over_count == null ||
      roll_over_monthly_allowed == null
    ) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const { policy_id } = req.params;

    const [result] = await connection.query(
      `UPDATE leavepolicy 
       SET leave_type_name = ?, 
           need_approval = ?, 
           allow_half_day = ?, 
           max_days_per_year = ?, 
           paid = ?, 
           deduct_salary = ?, 
           approval_level_needed = ?, 
           max_days_per_month = ?, 
           not_approved_leave = ?, 
           roll_over_allowed = ?, 
           roll_over_count = ?, 
           roll_over_monthly_allowed = ?
       WHERE leavepolicy_id = ?`,
      [
        leave_type_name,
        need_approval,
        allow_half_day,
        max_days_per_year,
        paid,
        deduct_salary,
        approval_level_needed,
        max_days_per_month,
        JSON.stringify(not_approved_leave),
        roll_over_allowed,
        roll_over_count,
        roll_over_monthly_allowed,
        policy_id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Leave policy not found" });
    }

    res.status(200).json({
      message: "Leave policy updated successfully",
    });
  } catch (error) {
    console.error("Error updating leave policy:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLeavePolicies = async (req, res) => {
  try {
    const [results] = await connection.query(`SELECT * FROM leavepolicy`);

    res.status(200).json({
      message: "Leave policies fetched successfully",
      policies: results,
    });
  } catch (error) {
    console.error("Error fetching leave policies:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
