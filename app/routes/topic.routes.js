const topicsRouter = require("express").Router();
const { getTopics, postTopic } = require("../controllers/topic.controller");
const { forbiddenMethod } = require("./utils/forbidden-method");

topicsRouter.get("/", getTopics);
topicsRouter.post("/", postTopic);
topicsRouter.patch("/", forbiddenMethod);
topicsRouter.delete("/", forbiddenMethod);

module.exports = topicsRouter;
