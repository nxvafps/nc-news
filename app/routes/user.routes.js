const usersRouter = require("express").Router();
const {
  getUsers,
  getUserByUsername,
} = require("../controllers/user.controller");
const { forbiddenMethod } = require("./utils/forbidden-method");

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
usersRouter.get("/", getUsers);
usersRouter.post("/", forbiddenMethod);
usersRouter.patch("/", forbiddenMethod);
usersRouter.delete("/", forbiddenMethod);

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
usersRouter.get("/:username", getUserByUsername);
usersRouter.post("/:username", forbiddenMethod);
usersRouter.patch("/:username", forbiddenMethod);
usersRouter.delete("/:username", forbiddenMethod);

module.exports = usersRouter;
