const express = require("express");
const apiRouter = require("./routes/api.routes");
const errorHandler = require("./middlewares/error-handler");
const AppError = require("./utils/app-error");

const app = express();

app.use("/api", apiRouter);

app.all("*", (req, res, next) => {
  next(AppError.notFound(`Can't find ${req.originalUrl} on this server`));
});

app.use(errorHandler);

module.exports = app;
