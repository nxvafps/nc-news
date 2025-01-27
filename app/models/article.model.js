const db = require("../../db/connection");
const AppError = require("../utils/app-error");

exports.selectArticleById = async (article_id) => {
  const articleIdNum = parseInt(article_id);
  if (isNaN(articleIdNum)) {
    return Promise.reject(AppError.badRequest("Invalid article ID"));
  }

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
