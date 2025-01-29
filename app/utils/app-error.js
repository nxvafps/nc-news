class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message) {
    return new AppError(message || "Bad request", 400);
  }

  static unauthorized(message) {
    return new AppError(message || "Unauthorized", 401);
  }

  static notFound(message) {
    return new AppError(message || "Not found", 404);
  }

  static methodNotAllowed(message) {
    return new AppError(message || "Method not allowed", 405);
  }

  static conflict(message) {
    return new AppError(message || "Conflict", 409);
  }

  static internal(message) {
    return new AppError(message || "Internal server error", 500);
  }
}

module.exports = AppError;
