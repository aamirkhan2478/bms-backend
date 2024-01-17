import express from "express";
const router = express.Router();
import {
  addTenant,
  showTenants,
  showTenant,
  updateImages,
  updateTenant,
  expiredCnic,
  updateCnic
} from "../controllers/tenant.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import ownerTenantSchema from "../validator/owner_tenant.validator.js";

router
  .route("/add")
  .post(
    upload.array("images", 10),
    validatorMiddleware(ownerTenantSchema),
    addTenant
  );
router.route("/all").get(showTenants);
router.route("/:id/show").get(showTenant);
router
  .route("/:id/update-images")
  .patch(upload.array("images", 10), updateImages);
router
  .route("/:id/update")
  .patch(validatorMiddleware(ownerTenantSchema), updateTenant);
router.route("/expired-cnic").get(expiredCnic);
router.route("/:id/update-cnic").patch(updateCnic);

export default router;
