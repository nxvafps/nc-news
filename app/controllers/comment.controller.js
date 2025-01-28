const {
  removeCommentById,
  updateCommentVotesById,
} = require("../models/comment.model");

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

  try {
    await removeCommentById(comment_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
