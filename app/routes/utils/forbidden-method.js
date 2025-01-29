const AppError = require("../../utils/app-error.js");

exports.handleForbiddenMethods = (router, allowedMethods = ["GET"]) => {
  const allMethods = ["GET", "POST", "PATCH", "PUT", "DELETE"];
  const forbiddenMethods = allMethods.filter(
    (method) => !allowedMethods.includes(method)
  );

  forbiddenMethods.forEach((method) => {
    router[method.toLowerCase()]("/", (req, res, next) => {
      next(AppError.methodNotAllowed());
    });
  });
};
