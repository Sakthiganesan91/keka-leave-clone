import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} ${level.toUpperCase()}: ${stack || message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.colorize({ all: true }),
    }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/flow.log" }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
});

export default logger;
