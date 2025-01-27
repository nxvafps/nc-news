const db = require("../../db/connection");
const AppError = require("../utils/app-error");

exports.selectArticles = async () => {
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
      COUNT(comments.comment_id)::TEXT AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC;
    `
  );

  return result.rows;
};

exports.selectArticleById = async (article_id) => {
  const result = await db.query(
    `SELECT * FROM articles 
     WHERE article_id = $1;`,
    [article_id]
  );

  if (result.rows.length === 0) {
    return Promise.reject(AppError.notFound("Article not found"));
  }

  return result.rows[0];
};
