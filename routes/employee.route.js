import express from "express";
import {
  addEmployee,
  setManager,
  getRemainingLeavesByEmployee,
  updateEmployee,
  getLeavesByEmployeeId,
  getLeavesByStatusAndEmployee,
  updateEmployeeStatus,
} from "../controllers/employee.controller.js";
import logger from "../config/logger.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const routes = express.Router();

/**
 * @swagger
 * /employees/add-employee:
 *   post:
 *     summary: Add a new employee.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               basic_salary:
 *                 type: number
 *               max_approval_level:
 *                 type: integer
 *               role:
 *                 type: string
 *               in_notice:
 *                 type: boolean
 *               performance_bonus:
 *                 type: number
 *               allowances:
 *                 type: number
 *               lop_deduction:
 *                 type: number
 *     responses:
 *       201:
 *         description: Employee added successfully.
 */
routes.post("/add-employee", requireAuth, checkAdmin, addEmployee);

/**
 * @swagger
 * /employees/set-manager:
 *   post:
 *     summary: Set a manager for an employee.
 *     parameters:
 *       - in: query
 *         name: employeeEmail
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the employee.
 *       - in: query
 *         name: managerEmail
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the manager.
 *     responses:
 *       201:
 *         description: Manager set successfully.
 */
routes.post("/set-manager", requireAuth, checkAdmin, setManager);

/**
 * @swagger
 * /employees/update-employee/{employee_id}:
 *   put:
 *     summary: Update an existing employee.
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the employee to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *               department:
 *                 type: string
 *               basic_salary:
 *                 type: number
 *               max_approval_level:
 *                 type: integer
 *               role:
 *                 type: string
 *               in_notice:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Employee updated successfully.
 *       404:
 *         description: Employee not found.
 */
routes.put("/update-employee/:employee_id", requireAuth, updateEmployee);

/**
 * @swagger
 * /employees/get-leave-remaining/{employee_id}:
 *   get:
 *     summary: Get remaining leaves for an employee.
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the employee.
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year for which remaining leaves are to be retrieved.
 *       - in: query
 *         name: leavepolicy_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the leave policy.
 *     responses:
 *       200:
 *         description: Remaining leaves retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 remaining_leaves:
 *                   type: integer
 *       404:
 *         description: Employee not found.
 */
routes.get(
  "/get-leave-remaining/:employee_id",
  requireAuth,
  getRemainingLeavesByEmployee
);

/**
 * @swagger
 * /employees/get-leaves-by-status:
 *   get:
 *     summary: Get leaves by status for an employee.
 *     parameters:
 *       - in: query
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the employee.
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *         description: Status of the leaves (e.g., approved, pending, rejected).
 *     responses:
 *       200:
 *         description: Leaves retrieved successfully.
 *
 *       404:
 *         description: Employee not found.
 */
routes.get("/get-leaves-by-status", requireAuth, getLeavesByStatusAndEmployee);

/**
 * @swagger
 * /employees/get-leave-by-employee/{employee_id}:
 *   get:
 *     summary: Get all leaves for a specific employee.
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the employee.
 *     responses:
 *       200:
 *         description: Leaves retrieved successfully.
 *
 *       404:
 *         description: Employee not found.
 */
routes.get(
  `/get-leave-by-employee/:employee_id`,
  requireAuth,
  getLeavesByEmployeeId
);

routes.put(
  "/update-employee-status/:employee_id",
  requireAuth,
  checkAdmin,
  updateEmployeeStatus
);

export { routes };
