import logger from "../config/logger.js";
import { getEmployeeById } from "../controllers/employee.controller.js";

export const checkAdmin = async (req, res, next) => {
  const employee_id = req.user.employee_id;
  const role = req.user.role;
  if (!employee_id) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  const user = getEmployeeById(employee_id);

  try {
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    logger.info("Admin access granted for employee ID:", employee_id);
    next();
  } catch (error) {
    logger.error("Error checking employee:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
