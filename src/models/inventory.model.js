import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    inventoryType: {
      type: String,
      required: true,
    },
    floor: {
      type: String,
      required: true,
    },
    flatNo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["for sell", "sold", "rented"],
      default: "for sell",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
