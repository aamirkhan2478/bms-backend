import express from "express";
const router = express.Router();
import {
  addOwner,
  showOwners,
  showOwner,
  updateImages,
  updateOwner,
} from "../controllers/owner.controller.js";
import ownerTenantSchema from "../validator/owner_tenant.validator.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import upload from "../middlewares/multer.middleware.js";

router
  .route("/add")
  .post(
    upload.array("images", 10),
    validatorMiddleware(ownerTenantSchema),
    addOwner
  );
router.route("/all").get(showOwners);
router.route("/:id").get(showOwner);
router
  .route("/:id/update-images")
  .patch(upload.array("images", 10), updateImages);
router
  .route("/:id/update")
  .patch(validatorMiddleware(ownerTenantSchema), updateOwner);

export default router;
