const winston = require("winston");
const path = require("path");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      silent: true,
    }),
  ],
});

if (process.env.NODE_ENV !== "test") {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    })
  );

  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
    })
  );

  if (process.env.NODE_ENV === "development") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      })
    );
  }
}

module.exports = {
  logger,
};
