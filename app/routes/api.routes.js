const apiRouter = require("express").Router();
const { handleForbiddenMethods } = require("./utils/forbidden-method");
const { getEndpoints } = require("../controllers/api.controller");
const articlesRouter = require("./article.routes");
const commentsRouter = require("./comment.routes");
const topicsRouter = require("./topic.routes");
const usersRouter = require("./user.routes");
const authRouter = require("./auth.routes");

apiRouter.get("/", getEndpoints);
handleForbiddenMethods(apiRouter, ["GET"]);

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/auth", authRouter);

module.exports = apiRouter;
