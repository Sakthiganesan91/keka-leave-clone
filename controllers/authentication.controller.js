import { query as connection } from "../config/database.js";
import logger from "../config/logger.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  logger.info("User login attempt", { email });

  const [result] = await connection.query(
    `SELECT * FROM employee WHERE email = ?`,
    [email]
  );
  if (result.length === 0) {
    logger.warn("Login failed: User not found", { email });
    return res.status(401).json({ message: "Invalid email or password" });
  }
  console.log(result[0]);
  const user = result[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.warn("Login failed: Incorrect password", { email });
    return res.status(401).json({ message: "Invalid email or password" });
  }

  logger.info("Login successful", { email });

  console.log("User");
  console.log(user);
  const token = jwt.sign(
    { id: user.employee_id, email: user.email, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, { httpOnly: true });
  res.status(200).json({ message: "Login successful", token });
};
