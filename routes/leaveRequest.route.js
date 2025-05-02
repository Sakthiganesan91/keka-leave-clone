import express from "express";
import {
  raiseLeaveRequest,
  cancelOrRejectLeaveRequest,
  getLeaveRequest,
  acceptLeaveRequest,
} from "../controllers/leaveRequest.controller.js";

const routes = express.Router();

/**
 * @swagger
 * /leave-requests/add-leave-request/{employee_id}:
 *   post:
 *     summary: Raise a leave request.
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the employee raising the leave request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leaveType:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               noofdays:
 *                 type: integer
 *               leave_reason:
 *                 type: string
 *               is_half_day:
 *                 type: boolean
 *               half_day_type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Leave request raised successfully.
 */
routes.post("/add-leave-request/:employee_id", raiseLeaveRequest);

/**
 * @swagger
 * /leave-requests/get-leave-request:
 *   get:
 *     summary: Get leave requests for a manager.
 *     parameters:
 *       - in: query
 *         name: manager_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the manager.
 *     responses:
 *       200:
 *         description: List of leave requests to be handled.
 */
routes.get("/get-leave-request", getLeaveRequest);

/**
 * @swagger
 * /leave-requests/cancel-leave-request/{leave_id}:
 *   put:
 *     summary: Cancel or reject a leave request.
 *     parameters:
 *       - in: path
 *         name: leave_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the leave request to cancel or reject.
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the approver.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellation_comment:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Leave request updated successfully.
 */
routes.put("/cancel-leave-request/:leave_id", cancelOrRejectLeaveRequest);

/**
 * @swagger
 * /leave-requests/approve-leave-request/{leave_id}:
 *   put:
 *     summary: Approve a leave request.
 *     parameters:
 *       - in: path
 *         name: leave_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the leave request to approve.
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the approver.
 *     responses:
 *       200:
 *         description: Leave request approved successfully.
 */
routes.put("/approve-leave-request/:leave_id", acceptLeaveRequest);

export { routes };
