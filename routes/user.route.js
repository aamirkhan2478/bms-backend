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

import auth from "../middlewares/auth.js";
import { registerMiddleware } from "../middlewares/validatorMiddleware.js";
import registerSchema from "../validator/authValidator.js";

router.post("/register", registerMiddleware(registerSchema), register);
router.post("/login", login);
router.put(
  "/update-user/:id",
  auth,
  registerMiddleware(registerSchema),
  updateUser
);
router.post("/refresh-token", auth, tokenRefresh);
router.get("/current-user", auth, loggedInUser);
router.get("/show-users", auth, showUsers);

export default router;
