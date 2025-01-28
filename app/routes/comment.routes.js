const commentsRouter = require("express").Router();
const {
  deleteCommentById,
  updateCommentVotes,
} = require("../controllers/comment.controller");
const { forbiddenMethod } = require("./utils/forbidden-method");

commentsRouter.get("/:comment_id", forbiddenMethod);
commentsRouter.post("/:comment_id", forbiddenMethod);
commentsRouter.patch("/:comment_id", updateCommentVotes);
commentsRouter.delete("/:comment_id", deleteCommentById);

module.exports = commentsRouter;
