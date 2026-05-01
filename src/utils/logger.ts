import winston from "winston";

const LOG_LEVEL = process.env["LOG_LEVEL"] ?? "info";
const NODE_ENV = process.env["NODE_ENV"] ?? "development";

/**
 * Structured logger using Winston.
 * - Development: Colorized console output
 * - Production: JSON format with file transport (error.log + combined.log)
 * - Test: Silent mode
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  NODE_ENV === "production"
    ? winston.format.json()
    : winston.format.combine(winston.format.colorize(), winston.format.simple()),
);

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: "election-education" },
  transports: [
    new winston.transports.Console({
      silent: NODE_ENV === "test",
    }),
  ],
});

if (NODE_ENV === "production") {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5_242_880,
      maxFiles: 5,
    }),
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5_242_880,
      maxFiles: 5,
    }),
  );
}
