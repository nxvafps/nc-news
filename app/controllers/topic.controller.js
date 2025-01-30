const { selectTopics, insertTopic } = require("../models/topic.model");
const AppError = require("../utils/app-error");

exports.getTopics = async (req, res, next) => {
  try {
    const topics = await selectTopics();
    res.status(200).send({ topics });
  } catch (err) {
    next(err);
  }
};

exports.postTopic = async (req, res, next) => {
  const { slug, description } = req.body;

  if (slug.toLowerCase() === "tea" || slug.toLowerCase() === "coffee") {
    return next(
      AppError.teapot("I'm a teapot, I cannot make articles about beverages!")
    );
  }

  try {
    const topic = await insertTopic(slug, description);
    res.status(201).send({ topic });
  } catch (err) {
    next(err);
  }
};
