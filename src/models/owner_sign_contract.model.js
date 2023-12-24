import mongoose from "mongoose";

const ownerSignContractSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },
  },
  { timestamps: true }
);

const OwnerSignContract = mongoose.model("OwnerSignContract", ownerSignContractSchema);

export default OwnerSignContract;
