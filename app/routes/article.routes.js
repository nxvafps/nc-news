const express = require("express");
const {
  getArticles,
  getArticleById,
  getArticleComments,
  postArticleComment,
  updateArticleVotes,
  postArticle,
  deleteArticleById,
  updateArticleBody,
  searchArticles,
} = require("../controllers/article.controller");
const { authenticate } = require("../middlewares/auth");
const { handleForbiddenMethods } = require("./utils/forbidden-method");

const articlesRouter = express.Router();

// /api/articles/
const rootRouter = express.Router();
/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter articles by author username
 *       - in: query
 *         name: topic
 *         schema:
 *           type: string
 *         description: Filter articles by topic
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Sort articles by field (title, topic, author, created_at, votes)
 *         default: created_at
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc)
 *         default: desc
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of articles per page
 *         default: 10
 *       - in: query
 *         name: p
 *         schema:
 *           type: integer
 *         description: Page number
 *         default: 1
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       article_id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       topic:
 *                         type: string
 *                       author:
 *                         type: string
 *                       body:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       votes:
 *                         type: integer
 *                       comment_count:
 *                         type: integer
 *       400:
 *         description: Bad request (invalid sort_by or order query)
 */
rootRouter.get("/", getArticles);
/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - topic
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: The article title
 *               topic:
 *                 type: string
 *                 description: The article topic slug
 *               body:
 *                 type: string
 *                 description: The article content
 *     responses:
 *       201:
 *         description: Article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 article:
 *                   type: object
 *                   properties:
 *                     article_id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     topic:
 *                       type: string
 *                     body:
 *                       type: string
 *                     author:
 *                       type: string
 *                     votes:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     comment_count:
 *                       type: integer
 *       400:
 *         description: Bad request - missing or invalid fields
 *       401:
 *         description: Unauthorized - authentication required
 */
rootRouter.post("/", authenticate, postArticle);
handleForbiddenMethods(rootRouter, ["GET", "POST"]);
articlesRouter.use("/", rootRouter);

// /api/articles/search
const searchRouter = express.Router();
/**
 * @swagger
 * /api/articles/search:
 *   get:
 *     summary: Search articles by title or body content
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of articles per page
 *         default: 10
 *       - in: query
 *         name: p
 *         schema:
 *           type: integer
 *         description: Page number
 *         default: 1
 *     responses:
 *       200:
 *         description: List of matching articles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       article_id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       topic:
 *                         type: string
 *                       author:
 *                         type: string
 *                       body:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       votes:
 *                         type: integer
 *                       article_img_url:
 *                         type: string
 *                       comment_count:
 *                         type: integer
 *                 total_count:
 *                   type: integer
 *       400:
 *         description: Search query missing or invalid pagination parameters
 */
searchRouter.get("/", searchArticles);
handleForbiddenMethods(searchRouter, ["GET"]);
articlesRouter.use("/search", searchRouter);

// /api/articles/:article_id
const singleArticleRouter = express.Router({ mergeParams: true });
/**
 * @swagger
 * /api/articles/{article_id}:
 *   get:
 *     summary: Get a single article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: article_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *     responses:
 *       200:
 *         description: Success - returns a single article
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 article:
 *                   type: object
 *                   properties:
 *                     article_id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     topic:
 *                       type: string
 *                     author:
 *                       type: string
 *                     body:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     votes:
 *                       type: integer
 *                     comment_count:
 *                       type: integer
 *       404:
 *         description: Article not found
 *       400:
 *         description: Invalid article_id format
 */
singleArticleRouter.get("/", getArticleById);
/**
 * @swagger
 * /api/articles/{article_id}:
 *   put:
 *     summary: Update article text
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: article_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *                 description: The new text for the article
 *     responses:
 *       200:
 *         description: Article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 article:
 *                   type: object
 *                   properties:
 *                     article_id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     topic:
 *                       type: string
 *                     author:
 *                       type: string
 *                     body:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     votes:
 *                       type: integer
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - user does not own the article
 *       404:
 *         description: Article not found
 *       400:
 *         description: Bad request - missing body
 */
singleArticleRouter.put("/", authenticate, updateArticleBody);
/**
 * @swagger
 * /api/articles/{article_id}:
 *   patch:
 *     summary: Update article votes
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: article_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inc_votes
 *             properties:
 *               inc_votes:
 *                 type: integer
 *                 description: The number of votes to add (or subtract if negative)
 *     responses:
 *       200:
 *         description: Article votes updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 article:
 *                   type: object
 *                   properties:
 *                     article_id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     topic:
 *                       type: string
 *                     author:
 *                       type: string
 *                     body:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     votes:
 *                       type: integer
 *                     comment_count:
 *                       type: integer
 *       400:
 *         description: Bad request - Invalid article_id or inc_votes
 *       404:
 *         description: Article not found
 */
singleArticleRouter.patch("/", authenticate, updateArticleVotes);
/**
 * @swagger
 * /api/articles/{article_id}:
 *   delete:
 *     summary: Delete an article by ID
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: article_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID to delete
 *     responses:
 *       204:
 *         description: Article successfully deleted
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - user does not own the article
 *       404:
 *         description: Article not found
 *       400:
 *         description: Invalid article_id format
 */
singleArticleRouter.delete("/", authenticate, deleteArticleById);
handleForbiddenMethods(singleArticleRouter, ["GET", "PUT", "PATCH", "DELETE"]);
articlesRouter.use("/:article_id", singleArticleRouter);

// /api/articles/:article_id/comments
const commentsRouter = express.Router({ mergeParams: true });
/**
 * @swagger
 * /api/articles/{article_id}/comments:
 *   get:
 *     summary: Get comments for a specific article
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: article_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of comments per page
 *         default: 10
 *       - in: query
 *         name: p
 *         schema:
 *           type: integer
 *         description: Page number
 *         default: 1
 *     responses:
 *       200:
 *         description: List of comments for the article
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       comment_id:
 *                         type: integer
 *                       body:
 *                         type: string
 *                       article_id:
 *                         type: integer
 *                       author:
 *                         type: string
 *                       votes:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Article not found
 *       400:
 *         description: Invalid article_id format
 */
commentsRouter.get("/", getArticleComments);
/**
 * @swagger
 * /api/articles/{article_id}/comments:
 *   post:
 *     summary: Add a new comment to an article
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: article_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The article ID to comment on
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body
 *             properties:
 *               body:
 *                 type: string
 *                 description: The comment text
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comment:
 *                   type: object
 *                   properties:
 *                     comment_id:
 *                       type: integer
 *                     body:
 *                       type: string
 *                     article_id:
 *                       type: integer
 *                     author:
 *                       type: string
 *                     votes:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid article_id or missing comment body
 *       401:
 *         description: Unauthorized - authentication required
 *       404:
 *         description: Article not found
 */
commentsRouter.post("/", authenticate, postArticleComment);
handleForbiddenMethods(commentsRouter, ["GET", "POST"]);
articlesRouter.use("/:article_id/comments", commentsRouter);

module.exports = articlesRouter;
