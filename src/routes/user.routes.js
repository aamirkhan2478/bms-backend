import express from "express";
const router = express.Router();
import {
  register,
  login,
  updateUser,
  loggedInUser,
  tokenRefresh,
  showUsers,
} from "../controllers/user.controller.js";

import auth from "../middlewares/auth.middleware.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import authSchema from "../validator/auth.validator.js";

router.post("/register", auth, validatorMiddleware(authSchema), register);
router.post("/login", login);
router.put("/update/:id", auth, validatorMiddleware(authSchema), updateUser);
router.post("/refresh-token", auth, tokenRefresh);
router.get("/current-user", auth, loggedInUser);
router.get("/show-users", auth, showUsers);

export default router;
