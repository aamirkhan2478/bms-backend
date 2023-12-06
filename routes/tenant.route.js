import express from "express";
const router = express.Router();
import { addTenant } from "../controllers/tenant.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import ownerTenantSchema from "../validator/owner_tenant.validator.js";

router.post(
  "/",
  upload.array("images", 10),
  validatorMiddleware(ownerTenantSchema),
  addTenant
);

export default router;
