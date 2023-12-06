import express from "express";
const router = express.Router();
import { addOwner } from "../controllers/owner.controller.js";
import ownerSchema from "../validator/owner.validator.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import upload from "../middlewares/multer.middleware.js";

router.post(
  "/add-owner",
  upload.array("images", 10),
  validatorMiddleware(ownerSchema),
  addOwner
);

export default router;
