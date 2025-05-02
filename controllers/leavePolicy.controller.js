import { query as connection } from "../config/database.js";
import logger from "../config/logger.js";

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
    logger.info("Adding leave policy", req.body);
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
      logger.error("Required fields are missing", req.body);
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
    logger.info("Leave policy added successfully", result);
    res.status(201).json({
      message: "Leave policy added successfully",
      policy_id: result.insertId,
    });
  } catch (error) {
    logger.error("Error adding leave policy", error);

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

    const { policy_id } = req.params;
    if (!policy_id) {
      logger.error("Policy ID is required", req.body);
      return res.status(400).json({ message: "Policy ID is required" });
    }
    logger.info("Updating leave policy", req.body);
    logger.info("Leave policy ID", req.params.policy_id);
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
      logger.error("Required fields are missing", req.body);
      return res.status(400).json({ message: "Required fields are missing" });
    }

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
      logger.error("Leave policy not found", req.params.policy_id);
      return res.status(404).json({ message: "Leave policy not found" });
    }
    logger.info("Leave policy updated successfully", result);
    res.status(200).json({
      message: "Leave policy updated successfully",
    });
  } catch (error) {
    logger.error("Error updating leave policy:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLeavePolicies = async (req, res) => {
  try {
    logger.info("Fetching leave policies");
    const [results] = await connection.query(`SELECT * FROM leavepolicy`);
    if (results.length === 0) {
      logger.info("No leave policies found");
      return res.status(404).json({ message: "No leave policies found" });
    }
    logger.info("Leave policies fetched successfully", results);
    res.status(200).json({
      message: "Leave policies fetched successfully",
      policies: results,
    });
  } catch (error) {
    logger.error("Error fetching leave policies:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
