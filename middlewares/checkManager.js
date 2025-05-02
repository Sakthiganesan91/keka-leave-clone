import { query as connection } from "../database.js";

//TODO : modify after implemnting authentication
export const checkManager = async (req, res, next) => {
  try {
    if (role !== "manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [results] = await connection.query(
      "SELECT * FROM employee WHERE employee_id = ?",
      [employee_id]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    next();
  } catch (error) {
    console.error("Error checking manager:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
