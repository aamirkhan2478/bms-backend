import { Router } from "express";
import { sellInventory } from "../controllers/sell_inventory.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import sellInventorySchema from "../validator/sell_inventory.validator.js";
const router = Router();

router.put("/", validatorMiddleware(sellInventorySchema), sellInventory);

export default router;