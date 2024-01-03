import express from "express";
import {
  addInventory,
  sellInventory,
  showInventories,
  showInventory,
  shownInventoriesWithOwners,
  updateInventory,
} from "../controllers/inventory.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import inventorySchema from "../validator/inventory.validator.js";
import sellInventorySchema from "../validator/sell_inventory.validator.js";
const router = express.Router();

router.route("/add").post(validatorMiddleware(inventorySchema), addInventory);
router
  .route("/sell")
  .post(validatorMiddleware(sellInventorySchema), sellInventory);
router.route("/all").get(showInventories);
router.route("/show-inventories-with-owners").get(shownInventoriesWithOwners);
router.route("/:id").get(showInventory);
router.route("/:id/update").patch(validatorMiddleware(inventorySchema), updateInventory);
export default router;
