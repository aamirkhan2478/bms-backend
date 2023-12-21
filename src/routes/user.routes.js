import express from "express";
const router = express.Router();
import {
  register,
  login,
  updateUser,
  tokenRefresh,
  showUsers,
  userLogout,
  getUserById,
  changePassword,
  deleteUser,
  currentUser,
} from "../controllers/user.controller.js";

import auth from "../middlewares/auth.middleware.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import authSchema from "../validator/auth.validator.js";

router.route("/register").post(auth, validatorMiddleware(authSchema), register);
router.route("/login").post(login);
router.route("/current-user").get(auth, currentUser);
router.route("/logout").post(auth, userLogout);
router.route("/refresh-token").post(tokenRefresh);
router.route("/:id/update").put(auth, updateUser);
router.route("/change-password").put(auth, changePassword);
router.route("/").get(auth, showUsers);
router.route("/:id").get(auth, getUserById);
router.route("/:id/delete").delete(auth, deleteUser);

export default router;
