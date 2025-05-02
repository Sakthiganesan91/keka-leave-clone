import logger from "../config/logger";

export const checkHR = async (req, res, next) => {
  const employee_id = req.user.employee_id;
  const role = req.user.role;
  try {
    if (!employee_id) {
      return res.status(400).json({ message: "Employee ID is Not Valid" });
    }
    if (role !== "hr") {
      return res.status(403).json({ message: "Access denied" });
    }
    logger.info("HR access granted for employee ID:", employee_id);
    next();
  } catch (error) {
    logger.error("Error checking HR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
