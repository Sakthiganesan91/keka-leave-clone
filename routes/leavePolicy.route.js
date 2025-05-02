import express from "express";
import {
  addLeavePolicy,
  updateLeavePolicy,
  getLeavePolicies,
} from "../controllers/leavePolicy.controller.js";

const routes = express.Router();

/**
 * @swagger
 * /leave-policies/add-policy:
 *   post:
 *     summary: Add a new leave policy.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leave_type_name:
 *                 type: string
 *               need_approval:
 *                 type: boolean
 *               allow_half_day:
 *                 type: boolean
 *               max_days_per_year:
 *                 type: integer
 *               paid:
 *                 type: boolean
 *               deduct_salary:
 *                 type: boolean
 *               approval_level_needed:
 *                 type: integer
 *               max_days_per_month:
 *                 type: integer
 *               not_approved_leave:
 *                 type: object
 *               roll_over_allowed:
 *                 type: boolean
 *               roll_over_count:
 *                 type: integer
 *               roll_over_monthly_allowed:
 *                 type: boolean
 *
 *     responses:
 *       201:
 *         description: Leave policy added successfully.
 */
routes.post("/add-policy", addLeavePolicy);

/**
 * @swagger
 * /leave-policies/update-policy/{policy_id}:
 *   put:
 *     summary: Update an existing leave policy.
 *     parameters:
 *       - in: path
 *         name: policy_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the leave policy to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leave_type_name:
 *                 type: string
 *               need_approval:
 *                 type: boolean
 *               allow_half_day:
 *                 type: boolean
 *               max_days_per_year:
 *                 type: integer
 *               paid:
 *                 type: boolean
 *               deduct_salary:
 *                 type: boolean
 *               approval_level_needed:
 *                 type: integer
 *               max_days_per_month:
 *                 type: integer
 *               not_approved_leave:
 *                 type: object
 *               roll_over_allowed:
 *                 type: boolean
 *               roll_over_count:
 *                 type: integer
 *               roll_over_monthly_allowed:
 *                 type: boolean
 *
 *     responses:
 *       200:
 *         description: Leave policy updated successfully.
 *       404:
 *         description: Leave policy not found.
 */
routes.put("/update-policy/:policy_id", updateLeavePolicy);

/**
 * @swagger
 * /leave-policies/get-policies:
 *   get:
 *     summary: Get all leave policies.
 *     responses:
 *       200:
 *         description: List of leave policies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 policies:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       leavepolicy_id:
 *                         type: integer
 *                       leave_type_name:
 *                         type: string
 *                       need_approval:
 *                         type: integer
 *                       allow_half_day:
 *                         type: integer
 *                       max_days_per_year:
 *                         type: integer
 *                         nullable: true
 *                       paid:
 *                         type: integer
 *                       deduct_salary:
 *                         type: integer
 *                       approval_level_needed:
 *                         type: integer
 *                       max_days_per_month:
 *                         type: integer
 *                         nullable: true
 *                       policy_date:
 *                         type: string
 *                         format: date-time
 *                       not_approved_leave:
 *                         type: string
 *                         nullable: true
 *                       roll_over_allowed:
 *                         type: integer
 *                       roll_over_count:
 *                         type: integer
 *                       roll_over_monthly_allowed:
 *                         type: integer
 */
routes.get("/get-policies", getLeavePolicies);

export { routes };
