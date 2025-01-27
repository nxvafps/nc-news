const apiRouter = require("express").Router();
const { getEndpoints } = require("../controllers/api.controller");
const articlesRouter = require("./article.routes");
const topicsRouter = require("./topic.routes");

apiRouter.get("/", getEndpoints);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);

module.exports = apiRouter;
