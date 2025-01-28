const commentsRouter = require("express").Router();
const {
  deleteCommentById,
  updateCommentVotes,
} = require("../controllers/comment.controller");

commentsRouter.patch("/:comment_id", updateCommentVotes);
commentsRouter.delete("/:comment_id", deleteCommentById);

module.exports = commentsRouter;
