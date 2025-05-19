import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import { query as connection } from "../config/database.js";
export const requireAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    logger.warn("No token provided, access denied");
    return res.status(403).json({ message: "Not Authorized" });
  }

  try {
    const result = jwt.verify(token, process.env.SECRET_KEY);
    const { id } = result;

    if (!id) {
      logger.warn("Invalid token, access denied");
      return res.status(403).json({ message: "Not Authorized" });
    }
    logger.info("Token verified successfully", id);
    const [results] = await connection.query(
      `SELECT * FROM employee WHERE employee_id = ?`,
      [id]
    );
    if (results.length === 0) {
      return res.status(403).json({ message: "Not Authorized" });
    }

    req.user = results[0];
    logger.info("User authenticated successfully", req.user);

    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    res.status(403).json({ message: "Not Authorized" });
  }
};
