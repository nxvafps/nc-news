const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/topic.controller");

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;
