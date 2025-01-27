const {
  selectArticles,
  selectArticleById,
  selectArticleComments,
} = require("../models/article.model");

exports.getArticles = async (req, res, next) => {
  try {
    const articles = await selectArticles();
    res.status(200).json({ articles });
  } catch (err) {
    next(err);
  }
};

exports.getArticleById = async (req, res, next) => {
  const { article_id } = req.params;

  try {
    const article = await selectArticleById(article_id);
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.getArticleComments = async (req, res, next) => {
  const { article_id } = req.params;

  try {
    const comments = await selectArticleComments(article_id);
    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};
