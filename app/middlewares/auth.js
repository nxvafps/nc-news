const jwt = require("jsonwebtoken");
const AppError = require("../utils/app-error");

exports.authenticate = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);
    const decoded = verifyToken(token);

    req.user = { username: decoded.username };
    next();
  } catch (err) {
    handleAuthError(err, next);
  }
};

const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw AppError.unauthorized("No token provided");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw AppError.unauthorized("No token provided");
  }

  return token;
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const handleAuthError = (err, next) => {
  if (err.name === "JsonWebTokenError") {
    return next(AppError.unauthorized("Invalid token"));
  }
  next(err);
};
