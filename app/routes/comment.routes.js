const commentsRouter = require("express").Router();
const {
  deleteCommentById,
  updateCommentVotes,
} = require("../controllers/comment.controller");
const { forbiddenMethod } = require("./utils/forbidden-method");

commentsRouter.get("/:comment_id", forbiddenMethod);
commentsRouter.post("/:comment_id", forbiddenMethod);
/**
 * @swagger
 * /api/comments/{comment_id}:
 *   patch:
 *     summary: Update comment votes
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The comment ID
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
 *         description: Comment votes updated successfully
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
 *         description: Bad request - Invalid comment_id or inc_votes
 *       404:
 *         description: Comment not found
 */
commentsRouter.patch("/:comment_id", updateCommentVotes);
/**
 * @swagger
 * /api/comments/{comment_id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The comment ID to delete
 *     responses:
 *       204:
 *         description: Comment successfully deleted
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Forbidden - user does not own the comment
 *       404:
 *         description: Comment not found
 *       400:
 *         description: Invalid comment_id format
 */
commentsRouter.delete("/:comment_id", deleteCommentById);

module.exports = commentsRouter;
