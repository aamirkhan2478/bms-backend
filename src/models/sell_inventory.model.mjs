import mongoose from "mongoose";

const sellInventory = new mongoose.Schema(
  {
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const SellInventory = mongoose.model("SellInventory", sellInventory);

export default SellInventory;
