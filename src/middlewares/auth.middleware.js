import jwt from "jsonwebtoken";
import asyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const verifyToken = (token) => {
  if (!token) {
    throw new ApiError(401, "No token provided");
  }

  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token");
  }
};

const findUser = async (id) => {
  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "Invalid access token");
  }

  return user;
};

const auth = asyncHandler(async (req, _, next) => {
  const token = req.cookies.token;
  const decoded = verifyToken(token);
  req.user = await findUser(decoded.id);
  next();
});

export default auth;