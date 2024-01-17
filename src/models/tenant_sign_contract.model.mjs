import mongoose from "mongoose";

const tenantSignContractSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
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

const TenantSignContract = mongoose.model(
  "TenantSignContract",
  tenantSignContractSchema
);

export default TenantSignContract;
