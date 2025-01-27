const apiRouter = require("express").Router();
const { getEndpoints } = require("../controllers/api.controller");
const topicsRouter = require("./topic.routes");

apiRouter.get("/", getEndpoints);
apiRouter.use("/topics", topicsRouter);

module.exports = apiRouter;
