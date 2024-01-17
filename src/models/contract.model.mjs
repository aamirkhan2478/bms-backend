import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
    },
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
      type: String,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;
