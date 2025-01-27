const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleById,
  getArticleComments,
} = require("../controllers/article.controller");

articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/:article_id/comments", getArticleComments);

module.exports = articlesRouter;
