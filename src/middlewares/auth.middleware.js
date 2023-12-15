import jwt from "jsonwebtoken";
import asyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const auth = asyncHandler(async (req, _, next) => {
  try {
    // Get the token from the request headers
    const token = req.cookies.token;

    if (!token) {
      throw new ApiError(401, "No token provided");
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find the user by the decoded token id
    const user = await User.findById(decoded.id).select(
      "-password -refreshToken"
    );

    // If no user is found
    if (!user) {
      throw new ApiError(404, "Invalid access token");
    }

    // Attach the decoded user information to the request object
    req.user = user;

    // Call the next middleware or route handler
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token");
  }
});

export default auth;
