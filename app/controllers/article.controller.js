const {
  selectArticles,
  selectArticleById,
  selectArticleComments,
  insertArticleComment,
  updateArticleVotesById,
  insertArticle,
  removeArticleById,
  updateArticleBodyById,
  fetchSearchArticles,
} = require("../models/article.model");

const AppError = require("../utils/app-error");

exports.getArticles = async (req, res, next) => {
  const {
    sort_by = "created_at",
    order = "desc",
    topic,
    limit = 10,
    p = 1,
    author,
  } = req.query;

  if (topic?.toLowerCase() === "tea" || topic?.toLowerCase() === "coffee") {
    return next(
      AppError.teapot("I'm a teapot, I cannot make articles about beverages!")
    );
  }

  try {
    const page = parseInt(p);
    const limitNum = parseInt(limit);

    if (isNaN(page) || isNaN(limitNum) || page < 1 || limitNum < 1) {
      throw AppError.badRequest("Bad request");
    }

    const { articles, total_count } = await selectArticles(
      sort_by,
      order,
      topic,
      limitNum,
      page,
      author
    );

    res.status(200).json({ articles, total_count });
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
  const { limit = 10, p = 1 } = req.query;

  try {
    const { comments, total_count } = await selectArticleComments(
      article_id,
      limit,
      p
    );
    res.status(200).send({ comments, total_count });
  } catch (err) {
    next(err);
  }
};

exports.postArticleComment = async (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req.body;
  const { username } = req.user;

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

exports.postArticle = async (req, res, next) => {
  const { title, body, topic, article_img_url } = req.body;
  const { username } = req.user;

  try {
    const article = await insertArticle(
      username,
      title,
      body,
      topic,
      article_img_url
    );
    res.status(201).json({ article });
  } catch (err) {
    next(err);
  }
};

exports.deleteArticleById = async (req, res, next) => {
  const { article_id } = req.params;
  const { username } = req.user;

  try {
    const article = await selectArticleById(article_id);

    if (article.author !== username) {
      throw AppError.forbidden("Forbidden - user does not own the article");
    }

    await removeArticleById(article_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.updateArticleBody = async (req, res, next) => {
  const { article_id } = req.params;
  const { body: newBody } = req.body;
  const { username } = req.user;

  try {
    if (!newBody) {
      throw AppError.badRequest("Bad request");
    }

    const article = await selectArticleById(article_id);

    if (article.author !== username) {
      throw AppError.forbidden("Forbidden - user does not own the article");
    }

    const updatedArticle = await updateArticleBodyById(article_id, newBody);
    res.status(200).send({ article: updatedArticle });
  } catch (err) {
    next(err);
  }
};

exports.searchArticles = async (req, res, next) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const p = parseInt(req.query.p) || 1;

    if (!q) {
      throw AppError.badRequest("Search query required");
    }

    const { articles, total_count } = await fetchSearchArticles(q, limit, p);

    res.status(200).json({
      articles,
      total_count,
    });
  } catch (err) {
    next(err);
  }
};
