const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  createUser,
  findUserByEmail,
  findUserByUsername,
} = require("../models/auth.model");
const AppError = require("../utils/app-error");

const generateToken = (username) => {
  return jwt.sign({ username }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

const validateFields = (fields, requiredFields) => {
  for (const field of requiredFields) {
    if (!fields[field]) {
      throw AppError.badRequest(`Missing ${field}`);
    }
  }
};

const formatUserResponse = (user, token) => {
  return {
    user: {
      username: user.username,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

const verifyPassword = async (password, hashedPassword) => {
  const isValid = await bcrypt.compare(password, hashedPassword);
  if (!isValid) {
    throw AppError.unauthorized("Invalid credentials");
  }
};

exports.signup = async (req, res, next) => {
  try {
    validateFields(req.body, ["username", "name", "email", "password"]);
    const { username, name, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(username, name, email, passwordHash);
    const token = generateToken(user.username);

    res.status(201).json(formatUserResponse(user, token));
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    validateFields(req.body, ["email", "password"]);
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      throw AppError.unauthorized("Invalid credentials");
    }

    await verifyPassword(password, user.password_hash);
    const token = generateToken(user.username);

    res.status(200).json(formatUserResponse(user, token));
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await findUserByUsername(req.user.username);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    res.status(200).json({
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};
