import Owner from "../models/owner.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";
import fileArray from "../utils/upload_images.utils.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { ApiError } from "../utils/ApiError.js";

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
    res.status(400).json(new ApiResponse(400, {}, "Email already exists"));
  }

  // Check if CNIC already exists
  const cnicExist = await Owner.findOne({ cnic });
  if (cnicExist) {
    res.status(400).json(new ApiResponse(400, {}, "CNIC already exists"));
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

// @route   GET /api/owner/all
// @desc    Get all owners
// @access  Private
export const showOwners = asyncHandler(async (_, res) => {
  const owners = await Owner.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy",
    },
    {
      $project: {
        name: 1,
        father: 1,
        cnic: 1,
        cnicExpiry: 1,
        phoneNumber: 1,
        emergencyNumber: 1,
        whatsapp: 1,
        email: 1,
        currentAddress: 1,
        permanentAddress: 1,
        jobTitle: 1,
        jobLocation: 1,
        jobOrganization: 1,
        images: 1,
        inventories: 1,
        createdBy: {
          name: 1,
          _id: 1,
        },
      },
    },
  ]);
  return res.status(200).json(new ApiResponse(200, { owners }, "Owners found"));
});
