import express from "express";
const router = express.Router();
import { addContract } from "../controllers/contract.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import contractSchema from "../validator/contract.validator.js";

router
  .route("/add")
  .post(
    upload.array("images", 10),
    validatorMiddleware(contractSchema),
    addContract
  );

export default router;
