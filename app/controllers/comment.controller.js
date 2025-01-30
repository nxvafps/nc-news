const {
  removeCommentById,
  updateCommentVotesById,
  selectCommentById,
  updateCommentBodyById,
} = require("../models/comment.model");
const AppError = require("../utils/app-error");

exports.updateCommentVotes = async (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  try {
    const comment = await updateCommentVotesById(comment_id, inc_votes);
    res.status(200).send({ comment });
  } catch (err) {
    next(err);
  }
};

exports.deleteCommentById = async (req, res, next) => {
  const { comment_id } = req.params;
  const { username } = req.user;

  try {
    const comment = await selectCommentById(comment_id);

    if (comment.author !== username) {
      throw AppError.forbidden("Forbidden - user does not own the comment");
    }

    await removeCommentById(comment_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.updateCommentBody = async (req, res, next) => {
  const { comment_id } = req.params;
  const { body } = req.body;
  const { username } = req.user;

  try {
    if (!body) throw AppError.badRequest("Bad request");
    const comment = await selectCommentById(comment_id);

    if (comment.author !== username) {
      throw AppError.forbidden("Forbidden - user does not own the comment");
    }

    const updatedComment = await updateCommentBodyById(comment_id, body);
    res.status(200).send({ comment: updatedComment });
  } catch (err) {
    next(err);
  }
};
