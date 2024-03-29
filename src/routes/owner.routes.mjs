import express from "express";
const router = express.Router();
import {
  addOwner,
  showOwners,
  showOwner,
  updateImages,
  updateOwner,
  expiredCnic,
  updateCnic
} from "../controllers/owner.controller.mjs";
import ownerTenantSchema from "../validator/owner_tenant.validator.mjs";
import validatorMiddleware from "../middlewares/validator.middleware.mjs";
import upload from "../middlewares/multer.middleware.mjs";

router
  .route("/add")
  .post(
    upload.array("images", 10),
    validatorMiddleware(ownerTenantSchema),
    addOwner
  );
router.route("/all").get(showOwners);
router.route("/:id/show").get(showOwner);
router
  .route("/:id/update-images")
  .patch(upload.array("images", 10), updateImages);
router
  .route("/:id/update")
  .patch(validatorMiddleware(ownerTenantSchema), updateOwner);
router.route("/expired-cnic").get(expiredCnic);
router.route("/:id/update-cnic").patch(updateCnic);
export default router;
