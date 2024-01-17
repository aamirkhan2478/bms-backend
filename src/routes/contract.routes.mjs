import express from "express";
const router = express.Router();
import {
  addContract,
  showContracts,
  showContract,
  contractDashboardCounts,
  updateContract,
  updateImages,
} from "../controllers/contract.controller.mjs";
import validatorMiddleware from "../middlewares/validator.middleware.mjs";
import upload from "../middlewares/multer.middleware.mjs";
import contractSchema from "../validator/contract.validator.mjs";

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
