const AppError = require("../utils/app-error");
const { logger } = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const requestInfo = {
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: req.headers,
  };

  if (err instanceof AppError) {
    logger.info({
      type: "Operational Error",
      statusCode: err.statusCode,
      message: err.message,
      request: requestInfo,
      timestamp: new Date().toISOString(),
    });

    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  if (err.code === "22P02" || err.code === "23502") {
    logger.error({
      type: "Database Error",
      code: err.code,
      detail: err.detail,
      request: requestInfo,
      timestamp: new Date().toISOString(),
    });

    return res.status(400).json({
      status: "fail",
      message: "Bad request",
    });
  }

  logger.error({
    type: "Unexpected Error",
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: requestInfo,
    timestamp: new Date().toISOString(),
  });

  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

module.exports = errorHandler;
