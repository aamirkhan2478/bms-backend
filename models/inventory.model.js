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
    owners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner",
        default: null,
      },
    ],
    status: {
      type: String,
      enum: ["vacant", "occupied"],
      default: "vacant",
    },
    isSold: {
      type: Boolean,
      default: false,
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
