import express from "express";
import {
  addLeavePolicy,
  updateLeavePolicy,
  getLeavePolicies,
  getLeavePoliciesData,
  deleteLeavePolicy,
} from "../controllers/leavePolicy.controller.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
import { checkAdmin } from "../middlewares/checkAdmin.js";

const routes = express.Router();

routes.post("/add-policy", requireAuth, checkAdmin, addLeavePolicy);

routes.put(
  "/update-policy/:policy_id",
  requireAuth,
  checkAdmin,
  updateLeavePolicy
);

routes.get("/get-policies", requireAuth, getLeavePolicies);

routes.get(
  "/get-leave-policies-data",
  requireAuth,
  checkAdmin,
  getLeavePoliciesData
);

routes.delete(
  "/delete-policies/:leavepolicyId",
  requireAuth,
  deleteLeavePolicy
);

export { routes };
