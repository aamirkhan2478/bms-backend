import jwt from "jsonwebtoken";
import asyncHandler from "../utils/AsyncHandler.mjs";
import User from "../models/user.model.mjs";
import { ApiResponse } from "../utils/ApiResponse.mjs";
// import { ApiError } from "../utils/ApiError.mjs";

const verifyToken = (res, token) => {
  if (!token) {
    res.status(401).json(new ApiResponse(401, {}, "No token provided"));
  }

  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    res
      .status(401)
      .json(new ApiResponse(401, {}, error?.message || "Invalid token"));
  }
};

const findUser = async (res, id) => {
  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    res.status(404).json(new ApiResponse(404, {}, "Invalid access token"));
  }

  return user;
};

const auth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  const decoded = verifyToken(res, token);
  req.user = await findUser(res, decoded.id);
  next();
});

export default auth;
