import express from "express";
import {
  addInventory,
  sellInventory,
  showInventories,
  showInventory,
  shownInventoriesWithOwners,
  updateInventory,
  inventoryOpenForSell,
  vacantInventories,
  soldInventories,
  updateStatus,
} from "../controllers/inventory.controller.mjs";
import validatorMiddleware from "../middlewares/validator.middleware.mjs";
import inventorySchema from "../validator/inventory.validator.mjs";
import sellInventorySchema from "../validator/sell_inventory.validator.mjs";
const router = express.Router();

router.route("/add").post(validatorMiddleware(inventorySchema), addInventory);
router
  .route("/sell")
  .post(validatorMiddleware(sellInventorySchema), sellInventory);
router.route("/all").get(showInventories);
router.route("/show-inventories-with-owners").get(shownInventoriesWithOwners);
router.route("/:id/show").get(showInventory);
router
  .route("/:id/update")
  .patch(validatorMiddleware(inventorySchema), updateInventory);
router.route("/open-for-sell").get(inventoryOpenForSell);
router.route("/vacant-inventories").get(vacantInventories);
router.route("/sold-inventories/all").get(soldInventories);
router.route("/update-status/:id").patch(updateStatus);
export default router;
