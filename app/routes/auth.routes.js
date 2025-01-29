const express = require("express");
const authRouter = require("express").Router();
const { signup, login, getMe } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth");
const { handleForbiddenMethods } = require("./utils/forbidden-method");

const rootRouter = express.Router();
handleForbiddenMethods(rootRouter, []);
authRouter.use("/", rootRouter);

const signupRouter = express.Router();
/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - name
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Bad request - missing required fields
 *       409:
 *         description: Conflict - username or email already exists
 */
signupRouter.post("/", signup);
handleForbiddenMethods(signupRouter, ["POST"]);
authRouter.use("/signup", signupRouter);

const loginRouter = express.Router();
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Bad request - missing email or password
 */
loginRouter.post("/", login);
handleForbiddenMethods(loginRouter, ["POST"]);
authRouter.use("/login", loginRouter);

const meRouter = express.Router();
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: User not found
 */
meRouter.get("/", authenticate, getMe);
handleForbiddenMethods(meRouter, ["GET"]);
authRouter.use("/me", meRouter);

module.exports = authRouter;
