import express from "express";
const router = express.Router();
import {
  register,
  login,
  updateUser,
  tokenRefresh,
  showUsers,
  userLogout,
} from "../controllers/user.controller.js";

import auth from "../middlewares/auth.middleware.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import authSchema from "../validator/auth.validator.js";

router.route("/register").post(auth, validatorMiddleware(authSchema), register);
router.route("/login").post(login);
router.route("/logout").post(auth, userLogout);
router
  .route("/:id/update")
  .put(auth, validatorMiddleware(authSchema), updateUser);
router.route("/refresh-token").post(auth, tokenRefresh);
router.route("/show-users").get(auth, showUsers);

export default router;
