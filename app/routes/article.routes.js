const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleById,
  getArticleComments,
  postArticleComment,
  updateArticleVotes,
} = require("../controllers/article.controller");

articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/:article_id/comments", getArticleComments);
articlesRouter.post("/:article_id/comments", postArticleComment);
articlesRouter.patch("/:article_id", updateArticleVotes);

module.exports = articlesRouter;
