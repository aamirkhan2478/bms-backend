import express from "express";
const router = express.Router();
import {
  addOwner,
  showInventoriesWithSpecificOwners,
} from "../controllers/owner.controller.js";
import ownerTenantSchema from "../validator/owner_tenant.validator.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import upload from "../middlewares/multer.middleware.js";

router
  .post(
    "/add",
    upload.array("images", 10),
    validatorMiddleware(ownerTenantSchema),
    addOwner
  )
  .get("/show-inventories", showInventoriesWithSpecificOwners);

export default router;
