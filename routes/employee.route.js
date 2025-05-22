import express from "express";
import {
  addEmployee,
  setManager,
  getRemainingLeavesByEmployee,
  updateEmployee,
  getLeavesByEmployeeId,
  getLeavesByStatusAndEmployee,
  updateEmployeeStatus,
  getTeamLeaves,
  getTeamEmployees,
  getRoles,
  getDepartments,
  getLeavesByEmployeeByMonth,
  getAllEmployees,
  changeEmployeeIsActive,
  changeEmployeeInNotice,
  bulkUploadEmployees,
  getByEmployeeId,
  getEmployeeById,
  updateEmployeePhoneNumber,
  updateEmployeePassword,
} from "../controllers/employee.controller.js";
import logger from "../config/logger.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";
import { upload } from "../config/multer.js";

const routes = express.Router();

routes.post("/add-employee", requireAuth, checkAdmin, addEmployee);

routes.post("/set-manager", requireAuth, checkAdmin, setManager);

routes.put("/update-employee/:employee_id", requireAuth, updateEmployee);

routes.get(
  "/get-leave-remaining/:employee_id",
  requireAuth,
  getRemainingLeavesByEmployee
);

routes.get("/get-leaves-by-status", requireAuth, getLeavesByStatusAndEmployee);

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

routes.get("/get-team-leaves", requireAuth, getTeamLeaves);

routes.get("/get-team-employees", requireAuth, getTeamEmployees);

routes.get("/get-roles", requireAuth, getRoles);
routes.get("/get-departments", requireAuth, getDepartments);

routes.get("/get-all-employees", requireAuth, checkAdmin, getAllEmployees);

routes.get(
  "/get-leave-remaining-by-month/:employee_id",
  requireAuth,
  getLeavesByEmployeeByMonth
);

routes.put("/change-employee-status/:employee_id", changeEmployeeIsActive);
routes.put("/change-employee-notice/:employee_id", changeEmployeeInNotice);

routes.post(
  `/bulk-upload`,
  requireAuth,
  checkAdmin,
  upload.single("file"),
  bulkUploadEmployees
);

routes.get("/get-employee/:employee_id", requireAuth, getByEmployeeId);

routes.put(
  `/update-phone/:employee_id`,
  requireAuth,
  updateEmployeePhoneNumber
);

routes.put(
  `/update-password/:employee_id`,
  requireAuth,
  updateEmployeePassword
);
export { routes };
