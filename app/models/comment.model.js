const db = require("../../db/connection");
const AppError = require("../utils/app-error");

exports.updateCommentVotesById = async (comment_id, inc_votes) => {
  if (inc_votes === undefined) {
    throw AppError.badRequest("Bad request");
  }

  if (typeof inc_votes !== "number") {
    throw AppError.badRequest("Bad request");
  }

  const result = await db.query(
    `UPDATE comments
     SET votes = votes + $1
     WHERE comment_id = $2
     RETURNING *`,
    [inc_votes, comment_id]
  );

  if (result.rows.length === 0) {
    throw AppError.notFound("Comment not found");
  }

  return result.rows[0];
};

exports.removeCommentById = async (comment_id) => {
  const result = await db.query(
    `DELETE FROM comments 
     WHERE comment_id = $1 
     RETURNING *;`,
    [comment_id]
  );

  if (result.rows.length === 0) {
    throw AppError.notFound("Comment not found");
  }

  return result.rows[0];
};

exports.selectCommentById = async (comment_id) => {
  const result = await db.query(
    `SELECT * FROM comments 
     WHERE comment_id = $1`,
    [comment_id]
  );

  if (result.rows.length === 0) {
    throw AppError.notFound("Comment not found");
  }

  return result.rows[0];
};
