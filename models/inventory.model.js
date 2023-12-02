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
    //   owner: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref:"Owner"
    //   },
    //   tenant: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref:"Tenant"
    //   },
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
