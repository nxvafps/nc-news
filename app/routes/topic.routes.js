const express = require("express");
const topicsRouter = require("express").Router();
const { getTopics, postTopic } = require("../controllers/topic.controller");
const { authenticate } = require("../middlewares/auth");
const { handleForbiddenMethods } = require("./utils/forbidden-method");

const rootRouter = express.Router();
/**
 * @swagger
 * /api/topics:
 *   get:
 *     summary: Get all topics
 *     tags: [Topics]
 *     responses:
 *       200:
 *         description: List of all topics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slug:
 *                         type: string
 *                         description: The topic's unique identifier
 *                       description:
 *                         type: string
 *                         description: Description of the topic
 *       500:
 *         description: Internal server error
 */
rootRouter.get("/", getTopics);
/**
 * @swagger
 * /api/topics:
 *   post:
 *     summary: Create a new topic
 *     tags: [Topics]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - description
 *             properties:
 *               slug:
 *                 type: string
 *                 description: The topic's unique identifier
 *               description:
 *                 type: string
 *                 description: Description of the topic
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topic:
 *                   type: object
 *                   properties:
 *                     slug:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Bad request - missing or invalid fields
 *       409:
 *         description: Conflict - topic slug already exists
 *       401:
 *         description: Unauthorized - authentication required
 */
rootRouter.post("/", authenticate, postTopic);
handleForbiddenMethods(rootRouter, ["GET", "POST"]);
topicsRouter.use("/", rootRouter);

module.exports = topicsRouter;
