import express from "express";
const router = express.Router();
import {
  addContract,
  showContracts,
  showContract,
  expireContract,
} from "../controllers/contract.controller.js";
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
router.route("/all").get(showContracts);
router.route("/:id/show").get(showContract);
router.route("/expire-contract").get(expireContract);

export default router;
