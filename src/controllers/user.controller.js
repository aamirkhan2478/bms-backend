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
    res.status(400).json(new ApiResponse(400, {}, "Email already exists"));
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
    res.status(400).json(new ApiResponse(400, {}, "Invalid credentials"));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(400).json(new ApiResponse(400, {}, "Invalid credentials"));
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

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

// @route   GET /api/user/current-user
// @desc    Get current user
// @access  Private
export const currentUser = asyncHandler((req, res) => {
  const { user } = req;
  return res.status(200).json({ user });
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

// @route   POST /api/user/refresh-token
// @desc    Refresh token
// @access  Public
export const tokenRefresh = asyncHandler(async (req, res) => {
  // Get the refresh token from the request cookies
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.status(401).json(new ApiResponse(401, {}, "No refresh token provided"));
  }

  // Verify the refresh token
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  // Find the user by the decoded token id
  const user = await User.findById(decoded.id).select(
    "-password -refreshToken"
  );

  // If no user is found
  if (!user) {
    res.status(404).json(new ApiResponse(404, {}, "Invalid refresh token"));
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user._id);

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
    .json(new ApiResponse(200, { user }, "Token refreshed successfully"));
});

// @route   PATCH /api/user/:id/update
// @desc    Update user
// @access  Private
export const updateUser = asyncHandler(async (req, res) => {
  // Get the user id
  const { id } = req.params;

  // Get the user input
  const { name, email, role } = req.body;

  // Check if user exists
  const user = await User.findById(id).select("-password -refreshToken");

  if (!user) {
    res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  // Update the user
  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;

  await user.save();

  return res.status(200).json(new ApiResponse(200, { user }, "User updated"));
});

// @route   PATCH /api/user/change-password
// @desc    Change password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  // Get the user input
  const { currentPassword, newPassword } = req.body;

  // Get the user id
  const { _id: id } = req.user;

  // Check if user exists
  const user = await User.findById(id);

  if (!user) {
    res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  // Check if current password matches
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400).json(new ApiResponse(400, {}, "Invalid credentials"));
  }

  // Update the password
  user.password = newPassword;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// @route   GET /api/user
// @desc    Get all users
// @access  Private
export const showUsers = asyncHandler(async (_, res) => {
  // Get all users
  const users = await User.find({}).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, { users }, "Users found"));
});

// @route  GET /api/user/:id
// @desc   Get user by id
// @access Private
export const getUserById = asyncHandler(async (req, res) => {
  // Get the user id
  const { id } = req.params;

  // Check if user exists
  const user = await User.findById(id).select("-password -refreshToken");
  if (!user) {
    res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, { user }, "User found"));
});

// @route   DELETE /api/user/:id/delete
// @desc    Delete user
// @access  Private
export const deleteUser = asyncHandler(async (req, res) => {
  // Get the user id
  const { id } = req.params;

  // Check if user exists
  const user = await User.findById(id);

  if (!user) {
    res.status(404).json(new ApiResponse(404, {}, "User not found"));
  }

  await user.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, "User deleted"));
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
