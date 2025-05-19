import express from "express";
import {
  raiseLeaveRequest,
  cancelOrRejectLeaveRequest,
  getLeaveRequest,
  acceptLeaveRequest,
} from "../controllers/leaveRequest.controller.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { checkManager } from "../middlewares/checkManager.js";
import { checkHR } from "../middlewares/checkHR.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";
const routes = express.Router();

routes.post("/add-leave-request/:employee_id", requireAuth, raiseLeaveRequest);

routes.get(
  "/get-leave-request",
  requireAuth,
  checkManager,
  checkHR,
  getLeaveRequest
);

routes.put(
  "/cancel-leave-request/:leave_id",
  requireAuth,
  cancelOrRejectLeaveRequest
);

routes.put(
  "/approve-leave-request/:leave_id",
  requireAuth,
  checkManager,
  checkHR,
  acceptLeaveRequest
);

export { routes };
