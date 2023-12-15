import Owner from "../models/owner.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";
import fileArray from "../utils/upload_images.utils.js";
import mongoose from "mongoose";
import Inventory from "../models/inventory.model.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// @route   POST /api/owner/add
// @desc    Add new owner
// @access  Private
export const addOwner = asyncHandler(async (req, res) => {
  const {
    name,
    father,
    cnic,
    cnicExpiry,
    phoneNumber,
    emergencyNumber,
    whatsapp,
    email,
    currentAddress,
    permanentAddress,
    jobTitle,
    jobLocation,
    jobOrganization,
  } = req.body;

  const { _id: id } = req.user;
  const phoneNumbers = mappingArray(phoneNumber);
  const emergencyNumbers = mappingArray(emergencyNumber);
  const whatsappNumbers = mappingArray(whatsapp);

  // Upload images
  const files = req.files;

  // https://domainname.com/uploads/filename-dfse3453ds.jpeg
  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  const imagesArray = await fileArray(files, basePath);

  // Check if email already exists
  const emailExist = await Owner.findOne({ email });
  if (emailExist) {
    throw new ApiError(400, "Email already exists");
  }

  // Check if CNIC already exists
  const cnicExist = await Owner.findOne({ cnic });
  if (cnicExist) {
    throw new ApiError(400, "CNIC already exists");
  }

  const owner = new Owner({
    name,
    father,
    cnic,
    cnicExpiry,
    phoneNumber: phoneNumbers,
    emergencyNumber: emergencyNumbers,
    whatsapp: whatsappNumbers,
    email,
    currentAddress,
    permanentAddress,
    jobTitle,
    jobLocation,
    jobOrganization,
    images: imagesArray,
    createdBy: id,
  });

  await owner.save();
  return res.status(201).json(new ApiResponse(200, { owner }, "Owner added"));
});

// @route   GET /api/owner/show-inventories
// @desc    Get all inventories with their owners
// @access  Private
export const showInventoriesWithSpecificOwners = asyncHandler(
  async (req, res) => {
    // Get the owner IDs from the query string
    let { ownerIds } = req.query;

    // Convert the comma-separated string of IDs to an array
    ownerIds = ownerIds.split(",").map((id) => id.trim());

    // Select only the owner Ids
    const owners = await Owner.find({
      _id: { $in: ownerIds },
    }).select("_id");

    // Extract the owner IDs from the retrieved owners
    const ids = owners.map((owner) => owner._id);

    // Check if any owners were found
    if (ids.length === 0) {
      throw new ApiError(404, "No owners found");
    }

    // Check the ObjectIds are valid
    if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      throw new ApiError(400, "Invalid owner id");
    }

    // Retrieve only the inventories that belong to the specified owners
    const inventories = await Inventory.find({
      owners: { $in: ids },
    }).select("inventoryType floor flatNo");

    return res
      .status(200)
      .json(new ApiResponse(200, { inventories }, "Inventories found"));
  }
);
