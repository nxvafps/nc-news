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

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw AppError.badRequest("Invalid email format");
  }
};

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    throw AppError.badRequest(
      "Username must be 3-20 characters and contain only letters, numbers, and underscores"
    );
  }
};

const validatePassword = (password) => {
  const validations = [
    {
      test: password.length >= 8,
      message: "Password must be at least 8 characters long",
    },
    {
      test: password.length <= 50,
      message: "Password must not exceed 50 characters",
    },
    {
      test: /[A-Z]/.test(password),
      message: "Password must contain at least one uppercase letter",
    },
    {
      test: /[a-z]/.test(password),
      message: "Password must contain at least one lowercase letter",
    },
    {
      test: /[0-9]/.test(password),
      message: "Password must contain at least one number",
    },
    {
      test: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      message: "Password must contain at least one special character",
    },
    {
      test: !/\s/.test(password),
      message: "Password must not contain spaces",
    },
  ];

  const failedValidations = validations.filter((v) => !v.test);
  if (failedValidations.length > 0) {
    throw AppError.badRequest(failedValidations[0].message);
  }
};

exports.signup = async (req, res, next) => {
  try {
    validateFields(req.body, ["username", "name", "email", "password"]);
    const { username, name, email, password } = req.body;

    validateEmail(email);
    validateUsername(username);
    validatePassword(password);

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
