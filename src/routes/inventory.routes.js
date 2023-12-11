import express from "express";
import {
  addInventory,
  showOwnersWithSpecificInventories,
  sellInventory,
} from "../controllers/inventory.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import inventorySchema from "../validator/inventory.validator.js";
import sellInventorySchema from "../validator/sell_inventory.validator.js";
const router = express.Router();

router
  .post("/add", validatorMiddleware(inventorySchema), addInventory)
  .put("/sell", validatorMiddleware(sellInventorySchema), sellInventory)
  .get("/show-owners", showOwnersWithSpecificInventories);

export default router;
