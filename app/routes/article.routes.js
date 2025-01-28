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

articlesRouter.get("/", getArticles);
articlesRouter.post("/", postArticle);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.patch("/:article_id", updateArticleVotes);
articlesRouter.delete("/:article_id", deleteArticleById);
articlesRouter.get("/:article_id/comments", getArticleComments);
articlesRouter.post("/:article_id/comments", postArticleComment);

module.exports = articlesRouter;
