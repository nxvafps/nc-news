const authRouter = require("express").Router();
const { signup, login, getMe } = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth");
const { forbiddenMethod } = require("./utils/forbidden-method");

authRouter.get("/", forbiddenMethod);
authRouter.post("/", forbiddenMethod);
authRouter.patch("/", forbiddenMethod);
authRouter.delete("/", forbiddenMethod);

authRouter.get("/signup", forbiddenMethod);
authRouter.post("/signup", signup);
authRouter.patch("/signup", forbiddenMethod);
authRouter.delete("/signup", forbiddenMethod);

authRouter.get("/login", forbiddenMethod);
authRouter.post("/login", login);
authRouter.patch("/login", forbiddenMethod);
authRouter.delete("/login", forbiddenMethod);

authRouter.get("/me", authenticate, getMe);
authRouter.post("/me", forbiddenMethod);
authRouter.patch("/me", forbiddenMethod);
authRouter.delete("/me", forbiddenMethod);

module.exports = authRouter;
