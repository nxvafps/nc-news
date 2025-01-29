const db = require("../../db/connection");
const AppError = require("../utils/app-error");

exports.createUser = async (username, name, email, passwordHash) => {
  const userExists = await db.query(
    "SELECT * FROM users WHERE username = $1 OR email = $2",
    [username, email]
  );

  if (userExists.rows.length > 0) {
    throw AppError.conflict("Username or email already exists");
  }

  const result = await db.query(
    `INSERT INTO users (username, name, email, password_hash) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [username, name, email, passwordHash]
  );

  return result.rows[0];
};

exports.findUserByEmail = async (email) => {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  return result.rows[0];
};

exports.findUserByUsername = async (id) => {
  const result = await db.query("SELECT * FROM users WHERE username = $1", [
    id,
  ]);

  return result.rows[0];
};
