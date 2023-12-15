import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";

const validatorMiddleware = (schema) =>
  asyncHandler(async (req, res, next) => {
    try {
      const parsedBody = await schema.parseAsync(req.body);
      req.body = parsedBody;
      next();
    } catch (err) {
      const message = err.errors[0].message;
      throw new ApiError(400, message);
    }
  });

export default validatorMiddleware;
