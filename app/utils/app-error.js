class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message) {
    return new AppError(message, 400);
  }

  static notFound(message) {
    return new AppError(message, 404);
  }

  static internal(message) {
    return new AppError(message || "Internal server error", 500);
  }
}

module.exports = AppError;
