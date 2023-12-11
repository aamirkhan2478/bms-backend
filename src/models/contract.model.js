import mongoose from "mongoose";

const contractSchema = new mongoose.Schema({
  tenants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
    },
  ],
  inventories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },
  ],
  owners: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
    },
  ],
  signingDate: {
    type: Date,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  renewalDate: {
    type: Date,
    required: true,
  },
  monthlyRentalAmount: {
    type: String,
    required: true,
  },
  monthlyTaxAmount: {
    type: String,
    required: true,
  },
  buildingManagementCharges: {
    type: String,
    required: true,
  },
  securityDepositAmount: {
    type: String,
    required: true,
  },
  annualRentalIncrease: {
    type: String,
    required: true,
  },
  wapdaSubmeterReading: {
    type: Number,
  },
  generatorSubmeterReading: {
    type: Number,
  },
  waterSubmeterReading: {
    type: Number,
  },
  monthlyRentalDueDate: {
    type: Number,
    required: true,
  },
  monthlyRentalOverDate: {
    type: Number,
    required: true,
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
  },
  terminationNoticePeriod: {
    type: Number,
    required: true,
  },
  nonrefundableSecurityDeposit: {
    type: String,
    enum: ["yes", "no"],
    required: true,
  },
  remarks: {
    type: String,
    default: null,
  },
  images: [
    {
      type: String,
      default: null,
    },
  ],
});

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;
