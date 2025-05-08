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
    return res.status(401).json({ message: "Invalid Email or User Not found" });
  }

  const user = result[0];

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.warn("Login failed: Incorrect password", { email });
    return res.status(401).json({ message: "Invalid Password" });
  }

  logger.info("Login successful", { email });

  const token = jwt.sign(
    { id: user.employee_id, email: user.email, role: user.role },
    process.env.SECRET_KEY,
    { expiresIn: "4h" }
  );

  res.cookie("token", token, { httpOnly: true });
  res.status(200).json({ message: "Login successful", token, user: result[0] });
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
    });
    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token;

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

    return res.status(201).json({
      tokenValid: true,
    });
  } catch (error) {
    return res.status(403).json({
      tokenValid: false,
    });
  }
};
