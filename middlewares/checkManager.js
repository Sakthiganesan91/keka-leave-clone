import logger from "../config/logger.js";

export const checkManager = async (req, res, next) => {
  const employee_id = req.user.employee_id;
  const role = req.user.role;
  try {
    if (role !== "manager") {
      logger.warn("Access denied: User is not a manager", employee_id);
      return res.status(403).json({ message: "Access denied" });
    }
    logger.info("Manager access granted for employee ID:", employee_id);
    next();
  } catch (error) {
    logger.error("Error checking manager:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
