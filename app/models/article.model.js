const db = require("../../db/connection");
const AppError = require("../utils/app-error");

const selectArticles = async () => {
  const result = await db.query(
    `
    SELECT 
      articles.author,
      articles.title,
      articles.article_id,
      articles.topic,
      articles.created_at,
      articles.votes,
      articles.article_img_url,
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;
    `
  );

  return result.rows;
};

const selectArticleById = async (article_id) => {
  const result = await db.query(
    `SELECT * FROM articles 
     WHERE article_id = $1;`,
    [article_id]
  );

  if (result.rows.length === 0) {
    throw AppError.notFound("Article not found");
  }

  return result.rows[0];
};

const selectArticleComments = async (article_id) => {
  await selectArticleById(article_id);

  const result = await db.query(
    `
    SELECT 
      comment_id,
      votes,
      created_at,
      author,
      body,
      article_id
    FROM comments 
    WHERE article_id = $1
    ORDER BY created_at DESC;
    `,
    [article_id]
  );

  return result.rows;
};

const insertArticleComment = async (article_id, username, body) => {
  await selectArticleById(article_id);

  const userResult = await db.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  if (userResult.rows.length === 0) {
    throw AppError.notFound("Username not found");
  }

  const result = await db.query(
    `INSERT INTO comments 
      (body, article_id, author) 
     VALUES 
      ($1, $2, $3)
     RETURNING *`,
    [body, article_id, username]
  );

  return result.rows[0];
};

const updateArticleVotesById = async (article_id, inc_votes) => {
  const result = await db.query(
    `UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *`,
    [inc_votes, article_id]
  );

  if (result.rows.length === 0) {
    throw AppError.notFound("Article not found");
  }

  return result.rows[0];
};

module.exports = {
  selectArticles,
  selectArticleById,
  selectArticleComments,
  insertArticleComment,
  updateArticleVotesById,
};
