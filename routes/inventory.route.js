import express from "express";
import {
  addInventory,
  showOwnersWithSpecificInventories,
} from "../controllers/inventory.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import inventorySchema from "../validator/inventory.validator.js";
const router = express.Router();

router
  .post("/add", validatorMiddleware(inventorySchema), addInventory)
  .get("/show-owners", showOwnersWithSpecificInventories);

export default router;
