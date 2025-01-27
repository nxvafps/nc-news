const db = require("../../db/connection");
const AppError = require("../utils/app-error");

const selectArticles = async (
  sort_by = "created_at",
  order = "desc",
  topic
) => {
  const validColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
  ];

  if (!validColumns.includes(sort_by)) {
    throw AppError.badRequest("Bad request");
  }

  if (!["asc", "desc"].includes(order.toLowerCase())) {
    throw AppError.badRequest("Bad request");
  }

  let queryStr = `
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
  `;

  const queryParams = [];

  if (topic) {
    const topicCheckResult = await db.query(
      "SELECT * FROM topics WHERE slug = $1",
      [topic]
    );

    if (topicCheckResult.rows.length === 0) {
      throw AppError.notFound("Topic not found");
    }

    queryStr += " WHERE articles.topic = $1";
    queryParams.push(topic);
  }

  queryStr += ` GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}`;

  const result = await db.query(queryStr, queryParams);
  return result.rows;
};

const selectArticleById = async (article_id) => {
  const result = await db.query(
    `SELECT articles.*, 
      CAST(COUNT(comments.comment_id) AS VARCHAR) AS comment_count
     FROM articles 
     LEFT JOIN comments ON articles.article_id = comments.article_id
     WHERE articles.article_id = $1
     GROUP BY articles.article_id;`,
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
