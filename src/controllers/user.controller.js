import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// @route   POST /api/user/register
// @desc    Register new user
// @access  Private
export const register = asyncHandler(async (req, res) => {
  // Get the user input
  const { name, email, password, role } = req.body;

  // Check if user exists
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    throw new ApiError(400, "Email already exists");
  }

  // Create new user
  const user = new User({ name, email, password, role });
  await user.save();

  return res.status(201).json(new ApiResponse(200, {}, "User created"));
});

// @route   POST /api/user/login
// @desc    Login user
// @access  Public
export const login = asyncHandler(async (req, res) => {
  // Get the user input
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  // Get the logged in user
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Set the token in a cookie
  const options = {
    expires: new Date(Date.now() + 86400000), // 24 hours
    httpOnly: true,
    secure: process.env.SECURE || false, // set to true if your using https
  };

  return res
    .status(200)
    .cookie("token", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, { user: loggedInUser }, "Logged in successfully")
    );
});

// @route   UPDATE /api/user/:id/update
// @desc    Update user
// @access  Private
export const updateUser = asyncHandler(async (req, res) => {
  // Get the user input
  const { name, email, password, role } = req.body;

  // Get the user id
  const { id } = req.params;

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update user
  if (name) {
    user.name = name;
  }

  if (email) {
    user.email = email;
  }

  if (password) {
    user.password = password;
  }

  if (role) {
    user.role = role;
  }

  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "User updated"));
});

// @route   GET /api/user/show-users
// @desc    Get all users
// @access  Private
export const showUsers = asyncHandler(async (_, res) => {
  // Get all users
  const users = await User.find({}).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, { users }, "Users found"));
});

// @route   POST /api/user/refresh-token
// @desc    Refresh token
// @access  Private
export const tokenRefresh = asyncHandler(async (req, res) => {
  // Get the refresh token from the request cookies
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  // Verify the refresh token
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  // Find the user by the decoded token id
  const user = await User.findById(decoded.id);

  // If no user is found
  if (!user) {
    throw new ApiError(404, "Invalid refresh token");
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } =
    generateAccessAndRefreshToken(user._id);

  // Attach the new tokens to the response cookie
  const options = {
    expires: new Date(Date.now() + 86400000), // 24 hours
    httpOnly: true,
    secure: process.env.SECURE || false, // set to true if your using https
  };

  return res
    .status(200)
    .cookie("token", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, {}, "Token refreshed successfully"));
});

// @route   POST /api/user/logout
// @desc    Logout user
// @access  Private
export const userLogout = asyncHandler(async (req, res) => {
  const { _id: id } = req.user;
  // Remove the refresh token from the database
  await User.findByIdAndUpdate(
    id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  // Clear the cookies
  const options = {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: process.env.SECURE || false, // set to true if your using https
  };

  return res
    .status(200)
    .clearCookie("token", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// Private Functions

// Generate JWT Token
async function generateAccessAndRefreshToken(userID) {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating tokens for the user"
    );
  }
}
