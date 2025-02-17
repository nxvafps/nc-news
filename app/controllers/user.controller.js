const { findUserByUsername } = require("../models/auth.model");
const {
  selectUsers,
  selectUserByUsername,
  updateUserProfileById,
  updateUserAvatarById,
  removeUserById,
} = require("../models/user.model");

const AppError = require("../utils/app-error");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await selectUsers();
    res.status(200).send({ users });
  } catch (err) {
    next(err);
  }
};

exports.getUserByUsername = async (req, res, next) => {
  const { username } = req.params;

  try {
    const user = await selectUserByUsername(username);
    res.status(200).send({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { name, avatar_url } = req.body;

    const checkUser = await findUserByUsername(username);

    if (!checkUser) throw AppError.notFound("User not found");

    if (username !== req.user.username) {
      throw AppError.forbidden("Cannot update other users");
    }

    const user = await updateUserProfileById(username, { name, avatar_url });
    res.status(200).send({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateUserAvatar = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { avatar_url } = req.body;

    if (!avatar_url) {
      throw AppError.badRequest("Bad request");
    }

    const checkUser = await findUserByUsername(username);
    if (!checkUser) {
      throw AppError.notFound("User not found");
    }

    if (username !== req.user.username) {
      throw AppError.forbidden("Cannot update other users");
    }

    const user = await updateUserAvatarById(username, avatar_url);
    res.status(200).send({ user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUserAccount = async (req, res, next) => {
  try {
    const { username } = req.params;

    const checkUser = await findUserByUsername(username);
    if (!checkUser) {
      throw AppError.notFound("User not found");
    }

    if (username !== req.user.username) {
      throw AppError.forbidden("Cannot delete other users");
    }

    await removeUserById(username);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
