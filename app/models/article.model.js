const db = require("../../db/connection");
const AppError = require("../utils/app-error");

const selectArticles = async (
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10,
  page = 1,
  author
) => {
  const validColumns = [
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "comment_count",
  ];
  const validOrders = ["asc", "desc"];

  if (!validColumns.includes(sort_by) || !validOrders.includes(order)) {
    throw AppError.badRequest("Bad request");
  }

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);
  if (isNaN(limitNum) || isNaN(pageNum) || limitNum < 1 || pageNum < 1) {
    throw AppError.badRequest("Bad request");
  }

  if (topic) {
    const topicResult = await db.query("SELECT * FROM topics WHERE slug = $1", [
      topic,
    ]);
    if (topicResult.rows.length === 0) {
      throw AppError.notFound("Topic not found");
    }

    const articleCheck = await db.query(
      "SELECT 1 FROM articles WHERE topic = $1 LIMIT 1",
      [topic]
    );
    if (articleCheck.rows.length === 0) {
      return {
        articles: [],
        total_count: 0,
      };
    }
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
      COUNT(comments.comment_id)::INTEGER AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
  `;

  const queryParams = [];
  const conditions = [];

  if (topic) {
    conditions.push(`articles.topic = $${queryParams.length + 1}`);
    queryParams.push(topic);
  }

  if (author) {
    conditions.push(`articles.author = $${queryParams.length + 1}`);
    queryParams.push(author);
  }

  if (conditions.length > 0) {
    queryStr += ` WHERE ${conditions.join(" AND ")}`;
  }

  const countQuery = `
    SELECT COUNT(*) AS count 
    FROM articles
    ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
  `;

  const countResult = await db.query(countQuery, queryParams);
  const total_count = parseInt(countResult.rows[0].count);

  queryStr += ` GROUP BY articles.article_id`;

  if (sort_by === "comment_count") {
    queryStr += ` ORDER BY CAST(comment_count AS INT) ${order}`;
  } else {
    queryStr += ` ORDER BY articles.${sort_by} ${order}`;
  }

  const offset = (pageNum - 1) * limitNum;
  queryStr += ` LIMIT $${queryParams.length + 1} OFFSET $${
    queryParams.length + 2
  }`;
  queryParams.push(limitNum, offset);

  const result = await db.query(queryStr, queryParams);

  return {
    articles: result.rows,
    total_count,
  };
};

const selectArticleById = async (article_id) => {
  const result = await db.query(
    `SELECT articles.*, 
      COUNT(comments.comment_id)::INTEGER AS comment_count
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

const selectArticleComments = async (article_id, limit = 10, page = 1) => {
  await selectArticleById(article_id);

  const limitNum = parseInt(limit);
  const pageNum = parseInt(page);

  if (isNaN(limitNum) || isNaN(pageNum) || limitNum < 1 || pageNum < 1) {
    throw AppError.badRequest("Bad request");
  }

  const offset = (pageNum - 1) * limitNum;

  const countResult = await db.query(
    `SELECT COUNT(*) AS total_count 
     FROM comments 
     WHERE article_id = $1`,
    [article_id]
  );

  const total_count = parseInt(countResult.rows[0].total_count);

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
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
    `,
    [article_id, limitNum, offset]
  );

  return {
    comments: result.rows,
    total_count,
  };
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

const insertArticle = async (author, title, body, topic, article_img_url) => {
  const userResult = await db.query("SELECT * FROM users WHERE username = $1", [
    author,
  ]);
  if (userResult.rows.length === 0) {
    throw AppError.notFound("Author not found");
  }

  const topicResult = await db.query("SELECT * FROM topics WHERE slug = $1", [
    topic,
  ]);
  if (topicResult.rows.length === 0) {
    throw AppError.notFound("Topic not found");
  }

  const result = await db.query(
    `INSERT INTO articles 
      (author, title, body, topic, article_img_url) 
    VALUES 
      ($1, $2, $3, $4, COALESCE($5, 'https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700'))
    RETURNING *`,
    [author, title, body, topic, article_img_url]
  );

  const article = result.rows[0];
  article.comment_count = 0;

  return article;
};

const removeArticleById = async (article_id) => {
  await selectArticleById(article_id);

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM comments WHERE article_id = $1", [
      article_id,
    ]);

    await client.query("DELETE FROM articles WHERE article_id = $1", [
      article_id,
    ]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const updateArticleBodyById = async (article_id, body) => {
  const result = await db.query(
    `UPDATE articles
     SET body = $1
     WHERE article_id = $2
     RETURNING *`,
    [body, article_id]
  );

  if (result.rows.length === 0) {
    throw AppError.notFound("Article not found");
  }

  return result.rows[0];
};

const fetchSearchArticles = async (searchQuery, limit = 10, p = 1) => {
  if (!searchQuery) {
    throw AppError.badRequest("Search query required");
  }

  const offset = (p - 1) * limit;

  const searchSql = `
    SELECT 
      articles.*,
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE 
      LOWER(articles.title) LIKE LOWER($1) OR
      LOWER(articles.body) LIKE LOWER($1)
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC
    LIMIT $2 OFFSET $3;
  `;

  const countSql = `
    SELECT COUNT(*)::INT
    FROM articles
    WHERE 
      LOWER(title) LIKE LOWER($1) OR
      LOWER(body) LIKE LOWER($1);
  `;

  const searchTerm = `%${searchQuery}%`;

  const [articles, count] = await Promise.all([
    db.query(searchSql, [searchTerm, limit, offset]),
    db.query(countSql, [searchTerm]),
  ]);

  return {
    articles: articles.rows,
    total_count: count.rows[0].count,
  };
};

module.exports = {
  selectArticles,
  selectArticleById,
  selectArticleComments,
  insertArticleComment,
  updateArticleVotesById,
  insertArticle,
  removeArticleById,
  updateArticleBodyById,
  fetchSearchArticles,
};
