const db = require("../../db/connection");
const AppError = require("../utils/app-error");

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
