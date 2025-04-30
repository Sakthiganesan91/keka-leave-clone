import { getEmployeeById } from "../controllers/employee.controller.js";

export const checkEmployee = async (req, res, next) => {
  let employee_id = req.params.employee_id || req.body.employee_id;
  if (!employee_id) {
    return res.status(400).json({ message: "Employee ID is required" });
  }
  try {
    const employee = await getEmployeeById(employee_id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    next();
  } catch (error) {
    console.error("Error checking employee:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
