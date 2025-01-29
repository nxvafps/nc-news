const rateLimit = require("express-rate-limit");

exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many login attempts from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    message: "Too many API requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
