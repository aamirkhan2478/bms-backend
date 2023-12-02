import express from "express";
import { addInventory } from "../controllers/inventory.controller.js";
import validatorMiddleware from "../middlewares/validatorMiddleware.js";
import inventorySchema from "../validator/inventoryValidator.js";
const router = express.Router();

router.post(
  "/add-inventory",
  validatorMiddleware(inventorySchema),
  addInventory
);

export default router;
