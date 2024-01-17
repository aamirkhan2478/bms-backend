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
} from "../controllers/user.controller.mjs";

import auth from "../middlewares/auth.middleware.mjs";
import validatorMiddleware from "../middlewares/validator.middleware.mjs";
import authSchema from "../validator/auth.validator.mjs";

router.route("/register").post(auth, validatorMiddleware(authSchema), register);
router.route("/login").post(login);
router.route("/current-user").get(auth, currentUser);
router.route("/logout").post(auth, userLogout);
router.route("/refresh-token").post(tokenRefresh);
router.route("/:id/update").patch(auth, updateUser);
router.route("/change-password").patch(auth, changePassword);
router.route("/").get(auth, showUsers);
router.route("/:id").get(auth, getUserById);
router.route("/:id/delete").delete(auth, deleteUser);

export default router;
