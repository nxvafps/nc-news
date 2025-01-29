const express = require("express");
const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const apiRouter = require("./routes/api.routes");
const errorHandler = require("./middlewares/error-handler");
const AppError = require("./utils/app-error");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.all("*", (req, res, next) => {
  next(AppError.notFound(`Can't find ${req.originalUrl} on this server`));
});

app.use(errorHandler);

module.exports = app;
