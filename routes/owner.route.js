import express from "express";
const router = express.Router();
import { addOwner } from "../controllers/owner.controller.js";
import ownerTenantSchema from "../validator/owner_tenant.validator.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import upload from "../middlewares/multer.middleware.js";

router.post(
  "/",
  upload.array("images", 10),
  validatorMiddleware(ownerTenantSchema),
  addOwner
);

export default router;
