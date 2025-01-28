const { selectTopics, insertTopic } = require("../models/topic.model");

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

  try {
    const topic = await insertTopic(slug, description);
    res.status(201).send({ topic });
  } catch (err) {
    next(err);
  }
};
