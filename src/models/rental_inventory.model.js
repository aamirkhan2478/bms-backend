import mongoose from "mongoose";

const rentalInventorySchema = new mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  { timestamps: true }
);

const RentalInventory = mongoose.model(
  "TenantInventory",
  rentalInventorySchema
);

export default RentalInventory;
