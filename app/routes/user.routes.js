const express = require("express");
const usersRouter = require("express").Router();
const {
  getUsers,
  getUserByUsername,
  updateUserProfile,
  updateUserAvatar,
} = require("../controllers/user.controller");
const { handleForbiddenMethods } = require("./utils/forbidden-method");
const { authenticate } = require("../middlewares/auth");

const rootRouter = express.Router();
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       name:
 *                         type: string
 *                       avatar_url:
 *                         type: string
 *                         format: uri
 *       500:
 *         description: Internal server error
 */
rootRouter.get("/", getUsers);
handleForbiddenMethods(rootRouter, ["GET"]);
usersRouter.use("/", rootRouter);

const singleUserRouter = express.Router({ mergeParams: true });
/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Get a single user by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username to lookup
 *     responses:
 *       200:
 *         description: Success - returns a single user
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
 *                     avatar_url:
 *                       type: string
 *                       format: uri
 *                     email:
 *                       type: string
 *                       format: email
 *       404:
 *         description: User not found
 */
singleUserRouter.get("/", getUserByUsername);
/**
 * @swagger
 * /api/users/{username}:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the profile to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *                 description: URL to user's avatar image
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                     avatar_url:
 *                       type: string
 *                       format: uri
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - cannot update other users
 *       404:
 *         description: User not found
 */
singleUserRouter.patch("/", authenticate, updateUserProfile);
handleForbiddenMethods(singleUserRouter, ["GET", "PATCH"]);
usersRouter.use("/:username", singleUserRouter);

const avatarRouter = express.Router({ mergeParams: true });
/**
 * @swagger
 * /api/users/{username}/avatar:
 *   put:
 *     summary: Update user avatar
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: Username of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatar_url
 *             properties:
 *               avatar_url:
 *                 type: string
 *                 format: uri
 *                 description: URL to user's new avatar image
 *     responses:
 *       200:
 *         description: Avatar updated successfully
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
 *                     avatar_url:
 *                       type: string
 *                       format: uri
 *       400:
 *         description: Bad request - missing avatar_url
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - cannot update other users
 *       404:
 *         description: User not found
 */
avatarRouter.put("/", authenticate, updateUserAvatar);
handleForbiddenMethods(avatarRouter, ["PUT"]);
usersRouter.use("/:username/avatar", avatarRouter);

module.exports = usersRouter;
