import mongoose from "mongoose";
import Contract from "../models/contract.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";
import fileArray from "../utils/upload_images.utils.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { ApiError } from "../utils/ApiError.js";
import OwnerSignContract from "../models/owner_sign_contract.model.js";
import TenantSignContract from "../models/tenant_sign_contract.model.js";
import RentalInventory from "../models/rental_inventory.model.js";

// @route   POST /api/contract/add
// @desc    Add new contract
// @access  Private
export const addContract = asyncHandler(async (req, res) => {
  const {
    owners,
    inventory,
    tenants,
    signingDate,
    startDate,
    endDate,
    renewalDate,
    monthlyRentalAmount,
    monthlyTaxAmount,
    buildingManagementCharges,
    securityDepositAmount,
    annualRentalIncrease,
    wapdaSubmeterReading,
    generatorSubmeterReading,
    waterSubmeterReading,
    monthlyRentalDueDate,
    monthlyRentalOverDate,
    agent,
    terminationNoticePeriod,
    nonrefundableSecurityDeposit,
    remarks,
  } = req.body;

  const { _id: id } = req.user;

  const ownerArray = mappingArray(owners);
  const tenantArray = mappingArray(tenants);
  // Check inventory ObjectId is valid
  if (!mongoose.Types.ObjectId.isValid(inventory)) {
    res.status(400).json(new ApiResponse(400, {}, "Invalid inventory id"));
  }

  // Check owners ObjectId is valid
  for (let owner of ownerArray) {
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      res.status(400).json(new ApiResponse(400, {}, "Invalid owner id"));
    }
  }

  // Check tenants ObjectId is valid
  for (let tenant of tenantArray) {
    if (!mongoose.Types.ObjectId.isValid(tenant)) {
      res.status(400).json(new ApiResponse(400, {}, "Invalid tenant id"));
    }
  }

  // Check agent ObjectId is valid
  if (!mongoose.Types.ObjectId.isValid(agent)) {
    res.status(400).json(new ApiResponse(400, {}, "Invalid agent id"));
  }

  // Upload images
  const files = req.files;

  // https://domainname.com/uploads/filename-dfse3453ds.jpeg
  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  const imagesArray = await fileArray(files, basePath);

  const contract = new Contract({
    inventory,
    signingDate,
    startDate,
    endDate,
    renewalDate,
    monthlyRentalAmount,
    monthlyTaxAmount,
    buildingManagementCharges,
    securityDepositAmount,
    annualRentalIncrease,
    wapdaSubmeterReading,
    generatorSubmeterReading,
    waterSubmeterReading,
    monthlyRentalDueDate,
    monthlyRentalOverDate,
    agent,
    terminationNoticePeriod,
    nonrefundableSecurityDeposit,
    remarks,
    images: imagesArray,
    createdBy: id,
  });

  const createdContract = await contract.save();

  // Save signed contract to owners and tenants
  await OwnerSignContract.insertMany(
    owners.map((owner) => ({
      ownerId: owner,
      contractId: createdContract._id,
    }))
  );

  await TenantSignContract.insertMany(
    tenants.map((tenant) => ({
      tenantId: tenant,
      contractId: createdContract._id,
    }))
  );

  // Save tenants and inventory to rental inventory
  await RentalInventory.insertMany(
    tenants.map((tenant) => ({
      tenantId: tenant,
      inventoryId: inventory,
    }))
  );

  res.status(201).json(new ApiResponse(200, {}, "Contract added"));
});
