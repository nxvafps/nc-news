const db = require("../../db/connection");
const AppError = require("../utils/app-error");

exports.selectTopics = async () => {
  const result = await db.query("SELECT * FROM topics;");
  return result.rows;
};

exports.insertTopic = async (slug, description) => {
  if (!slug || !description) {
    throw AppError.badRequest("Bad request");
  }

  try {
    const result = await db.query(
      `INSERT INTO topics 
        (slug, description) 
       VALUES 
        ($1, $2)
       RETURNING *`,
      [slug, description]
    );
    return result.rows[0];
  } catch (err) {
    if (err.code === "23505" || err.constraint === "topics_pkey") {
      throw AppError.conflict("Topic already exists");
    }
    throw err;
  }
};
