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
        _id: false,
        owner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Owner",
          default: null,
        },
        purchaseDate: {
          type: Date,
          default: null,
        },
      },
    ],
    tenants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        default: null,
      },
    ],
    contracts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract",
        default: null,
      },
    ],
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
