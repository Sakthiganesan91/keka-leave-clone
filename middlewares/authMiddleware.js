const jwt = require("jsonwebtoken");
const { default: logger } = require("../config/logger");

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(403).json({ message: "Auth Token Required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { id } = jwt.verify(token, process.env.SECRET_KEY);
    if (!id) {
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
module.exports = requireAuth;
