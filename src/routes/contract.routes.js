import express from "express";
const router = express.Router();
import {
  addContract,
  showContracts,
  showContract,
  contractDashboardCounts,
  updateContract,
  updateImages,
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
router.route("/contract-dashboard-counts").get(contractDashboardCounts);
router
  .route("/:id/update")
  .put(validatorMiddleware(contractSchema), updateContract);
router
  .route("/:id/update-images")
  .patch(upload.array("images", 10), updateImages);

export default router;
