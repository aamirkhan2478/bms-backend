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
import  validatorMiddleware  from "../middlewares/validatorMiddleware.js";
import authSchema from "../validator/authValidator.js";

router.post("/register", validatorMiddleware(authSchema), register);
router.post("/login", login);
router.put(
  "/update-user/:id",
  auth,
  validatorMiddleware(authSchema),
  updateUser
);
router.post("/refresh-token", auth, tokenRefresh);
router.get("/current-user", auth, loggedInUser);
router.get("/show-users", auth, showUsers);

export default router;
