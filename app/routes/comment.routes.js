const commentsRouter = require("express").Router();
const { deleteCommentById } = require("../controllers/comment.controller");

commentsRouter.delete("/:comment_id", deleteCommentById);

module.exports = commentsRouter;
