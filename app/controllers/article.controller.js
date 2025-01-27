const {
  selectArticles,
  selectArticleById,
  selectArticleComments,
  insertArticleComment,
  updateArticleVotesById,
} = require("../models/article.model");

const AppError = require("../utils/app-error");

exports.getArticles = async (req, res, next) => {
  const { sort_by = "created_at", order = "desc" } = req.query;

  try {
    const articles = await selectArticles(sort_by, order);
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

exports.postArticleComment = async (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  try {
    const comment = await insertArticleComment(article_id, username, body);
    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};

exports.updateArticleVotes = async (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  try {
    const article = await updateArticleVotesById(article_id, inc_votes);
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};
