import mongoose from "mongoose";

const ownerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    father: {
      type: String,
      required: true,
    },
    cnic: {
      type: String,
      required: true,
      unique: true,
    },
    cnicExpiry: {
      type: Date,
      required: true,
    },
    phoneNumber: [
      {
        type: String,
        default: null,
      },
    ],
    emergencyNumber: [
      {
        type: String,
        default: null,
      },
    ],
    whatsapp: [
      {
        type: String,
        default: null,
      },
    ],
    email: {
      type: String,
      default: null,
    },
    currentAddress: {
      type: String,
      required: true,
    },
    permanentAddress: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
    },
    jobLocation: {
      type: String,
    },
    jobOrganization: {
      type: String,
    },
    images: [
      {
        type: String,
        default: null,
      },
    ],
    bankName: {
      type: String,
    },
    bankTitle: {
      type: String,
    },
    bankBranchAddress: {
      type: String,
    },
    bankAccountNumber: {
      type: String,
    },
    bankIbnNumber: {
      type: String,
    },
    remarks: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Owner = mongoose.model("Owner", ownerSchema);

export default Owner;
