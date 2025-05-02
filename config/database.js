import mysql from "mysql2";
import dotenv from "dotenv";

import logger from "./logger.js";

dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  })
  .on("connection", () => {
    logger.info("MySQL connection pool created successfully.");
  })
  .on("error", (err) => {
    logger.error("MySQL pool error: ", err);
    process.exit(1);
  });
export const query = pool.promise();
