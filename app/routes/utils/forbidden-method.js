const AppError = require("../../utils/app-error.js");

exports.forbiddenMethod = (req, res, next) => {
  next(AppError.methodNotAllowed());
};
