const { v4: uuidv4 } = require("uuid");
const { logger } = require("../utils/logger");

const SENSITIVE_FIELDS = [
  "password",
  "token",
  "authorization",
  "cookie",
  "secret",
  "apiKey",
  "api_key",
  "creditCard",
  "email",
];

const sanitizeValue = (key, value) => {
  if (
    typeof value === "string" &&
    SENSITIVE_FIELDS.some((field) =>
      key.toLowerCase().includes(field.toLowerCase())
    )
  ) {
    return "[REDACTED]";
  }
  return value;
};

const sanitizeObject = (obj) => {
  if (!obj) return obj;
  const sanitized = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = sanitizeValue(key, value);
    }
  });

  return sanitized;
};

exports.requestLogger = (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "test") {
      return next();
    }
    req.requestId = uuidv4();

    const requestInfo = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      params: sanitizeObject(req.params),
      query: sanitizeObject(req.query),
      body: sanitizeObject(req.body),
      headers: sanitizeObject(req.headers),
      timestamp: new Date().toISOString(),
    };

    logger.info({
      type: "Incoming Request",
      ...requestInfo,
    });

    next();
  } catch (error) {
    next(error);
  }
};
