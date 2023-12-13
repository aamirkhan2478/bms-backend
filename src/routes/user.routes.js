import express from "express";
const router = express.Router();
import {
  register,
  login,
  updateUser,
  loggedInUser,
  tokenRefresh,
  showUsers,
  userLogout,
} from "../controllers/user.controller.js";

import auth from "../middlewares/auth.middleware.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import authSchema from "../validator/auth.validator.js";

router
  .post("/register", auth, validatorMiddleware(authSchema), register)
  .post("/login", login)
  .put("/update/:id", auth, validatorMiddleware(authSchema), updateUser)
  .post("/refresh-token", auth, tokenRefresh)
  .get("/current-user", auth, loggedInUser)
  .get("/show-users", auth, showUsers)
  .get("/logout", auth, userLogout);

export default router;
