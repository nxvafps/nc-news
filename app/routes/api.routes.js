const apiRouter = require("express").Router();
const { forbiddenMethod } = require("./utils/forbidden-method");
const { getEndpoints } = require("../controllers/api.controller");
const articlesRouter = require("./article.routes");
const commentsRouter = require("./comment.routes");
const topicsRouter = require("./topic.routes");
const usersRouter = require("./user.routes");

apiRouter.get("/", getEndpoints);
apiRouter.post("/", forbiddenMethod);
apiRouter.patch("/", forbiddenMethod);
apiRouter.delete("/", forbiddenMethod);

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
