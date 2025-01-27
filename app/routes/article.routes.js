const articlesRouter = require("express").Router();
const { getArticleById } = require("../controllers/article.controller");

articlesRouter.get("/:article_id", getArticleById);

module.exports = articlesRouter;
