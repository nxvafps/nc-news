const apiRouter = require("express").Router();
const { getEndpoints } = require("../controllers/api.controller");

apiRouter.get("/", getEndpoints);

module.exports = apiRouter;
