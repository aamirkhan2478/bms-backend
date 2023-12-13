import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// @route   POST /api/user/register
// @desc    Register new user
// @access  Private
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const user = new User({ name, email, password, role });
    await user.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route   POST /api/user/login
// @desc    Login user
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const emailExist = await User.findOne({ email });
    if (!emailExist) {
      return res.status(400).json({ message: "Email does not exists" });
    }
    const isMatch = await bcrypt.compare(password, emailExist.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const accessToken = emailExist.generateAccessToken();
    const refreshToken = emailExist.generateRefreshToken();

    // Set the token in a cookie
    res.cookie("token", accessToken, { httpOnly: true, maxAge: 86400000 }); // maxAge is in milliseconds (24 hour in this example)
    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route   DELETE /api/user/update/:id
// @desc    Delete user
// @access  Private
export const updateUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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
    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/user/show-users
// @desc    Get all users
// @access  Private
export const showUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/user/current-user
// @desc    Get current user
// @access  Private
export const loggedInUser = (req, res) => {
  const currentUser = req.user;
  return res.status(200).json({ currentUser });
};

// @route   POST /api/user/refresh-token
// @desc    Refresh token
// @access  Private
export const tokenRefresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const accessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    return res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/user/logout
// @desc    Logout user
// @access  Private
export const userLogout = (_req, res) => {
  try {
    res.clearCookie("token");
    
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};