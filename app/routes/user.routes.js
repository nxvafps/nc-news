const usersRouter = require("express").Router();
const {
  getUsers,
  getUserByUsername,
} = require("../controllers/user.controller");
const { forbiddenMethod } = require("./utils/forbidden-method");

usersRouter.get("/", getUsers);
usersRouter.post("/", forbiddenMethod);
usersRouter.patch("/", forbiddenMethod);
usersRouter.delete("/", forbiddenMethod);

usersRouter.get("/:username", getUserByUsername);
usersRouter.post("/:username", forbiddenMethod);
usersRouter.patch("/:username", forbiddenMethod);
usersRouter.delete("/:username", forbiddenMethod);

module.exports = usersRouter;
