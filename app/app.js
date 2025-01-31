const express = require("express");
const cors = require("cors");
const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const apiRouter = require("./routes/api.routes");
const errorHandler = require("./middlewares/error-handler");
const AppError = require("./utils/app-error");
const {
  globalLimiter,
  authLimiter,
  apiLimiter,
} = require("./middlewares/rate-limit");
const { requestLogger } = require("./middlewares/request-logger");

const app = express();

app.use(cors());

app.use(express.json());
app.use(requestLogger);

//rate limiting middleware
if (process.env.NODE_ENV !== "test") {
  app.use(globalLimiter);
  app.use("/api/auth", authLimiter);
  app.use("/api", apiLimiter);
}

//routes
app.use("/api", apiRouter);

//documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//error handling middleware
app.all("*", (req, res, next) => {
  next(AppError.notFound(`Can't find ${req.originalUrl} on this server`));
});

app.use(errorHandler);

module.exports = app;
