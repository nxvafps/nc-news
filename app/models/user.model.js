const db = require("../../db/connection");
const AppError = require("../utils/app-error");

exports.selectUsers = async () => {
  const result = await db.query(`
    SELECT username, name, avatar_url
    FROM users;
  `);

  return result.rows;
};

exports.selectUserByUsername = async (username) => {
  const result = await db.query(
    `SELECT username, name, avatar_url
     FROM users 
     WHERE username = $1;`,
    [username]
  );

  if (result.rows.length === 0) {
    throw AppError.notFound("User not found");
  }

  return result.rows[0];
};
