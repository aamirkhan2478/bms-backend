import express from "express";
import { addInventory } from "../controllers/inventory.controller.js";
import validatorMiddleware from "../middlewares/validator.middleware.js";
import inventorySchema from "../validator/inventory.validator.js";
const router = express.Router();

router.post(
  "/add-inventory",
  validatorMiddleware(inventorySchema),
  addInventory
);

export default router;
