const AppError = require("../utils/app-error");

const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  if (err.code === "22P02" || err.code === "23502") {
    return res.status(400).json({
      status: "fail",
      message: "Bad request",
    });
  }

  console.error("Unexpected error:", err);

  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

module.exports = errorHandler;
