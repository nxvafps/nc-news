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

exports.updateUserProfileById = async (username, updates) => {
  const { name, avatar_url } = updates;

  const result = await db.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         avatar_url = COALESCE($2, avatar_url)
     WHERE username = $3
     RETURNING username, name, avatar_url`,
    [name, avatar_url, username]
  );

  if (result.rows.length === 0) {
    throw AppError.notFound("User not found");
  }

  return result.rows[0];
};

exports.updateUserAvatarById = async (username, avatar_url) => {
  const result = await db.query(
    `UPDATE users
     SET avatar_url = $1
     WHERE username = $2
     RETURNING username, name, avatar_url`,
    [avatar_url, username]
  );

  if (result.rows.length === 0) {
    throw AppError.notFound("User not found");
  }

  return result.rows[0];
};

exports.removeUserById = async (username) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM comments 
       WHERE author = $1`,
      [username]
    );

    await client.query(
      `DELETE FROM articles 
       WHERE author = $1`,
      [username]
    );

    const result = await client.query(
      `DELETE FROM users 
       WHERE username = $1 
       RETURNING *`,
      [username]
    );

    await client.query("COMMIT");

    if (result.rows.length === 0) {
      throw AppError.notFound("User not found");
    }

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
