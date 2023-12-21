import express from "express";
import {
  addInventory,
  showOwnersWithSpecificInventories,
  sellInventory,
  showInventories,
} from "../controllers/inventory.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import inventorySchema from "../validator/inventory.validator.js";
import sellInventorySchema from "../validator/sell_inventory.validator.js";
const router = express.Router();

router.route("/add").post(validatorMiddleware(inventorySchema), addInventory);
router
  .route("/sell")
  .put(validatorMiddleware(sellInventorySchema), sellInventory);
router.route("/all").get(showInventories);
router.route("/show-owners").get(showOwnersWithSpecificInventories);

export default router;
