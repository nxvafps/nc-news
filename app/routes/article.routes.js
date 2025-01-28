const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticleById,
  getArticleComments,
  postArticleComment,
  updateArticleVotes,
  postArticle,
  deleteArticleById,
} = require("../controllers/article.controller");
const { forbiddenMethod } = require("./utils/forbidden-method");

articlesRouter.get("/", getArticles);
articlesRouter.post("/", postArticle);
articlesRouter.patch("/", forbiddenMethod);
articlesRouter.delete("/", forbiddenMethod);

articlesRouter.get("/:article_id", getArticleById);
articlesRouter.post("/:article_id", forbiddenMethod);
articlesRouter.patch("/:article_id", updateArticleVotes);
articlesRouter.delete("/:article_id", deleteArticleById);

articlesRouter.get("/:article_id/comments", getArticleComments);
articlesRouter.post("/:article_id/comments", postArticleComment);
articlesRouter.patch("/:article_id/comments", forbiddenMethod);
articlesRouter.delete("/:article_id/comments", forbiddenMethod);

module.exports = articlesRouter;
