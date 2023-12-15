import Tenant from "../models/tenant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import mappingArray from "../utils/mapping_arrays.utils.js";
import fileArray from "../utils/upload_images.utils.js";

// @route   POST /api/tenant/add
// @desc    Add new tenant
// @access  Private
export const addTenant = asyncHandler(async (req, res) => {
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

  // upload images
  const files = req.files;

  // https://domainname.com/uploads/filename-dfse3453ds.jpeg
  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  const imagesArray = fileArray(files, basePath);

  // Check if email already exists
  const emailExist = await Tenant.findOne({ email });
  if (emailExist) {
    throw new ApiError(400, "Email already exists");
  }

  // Check if CNIC already exists
  const cnicExist = await Tenant.findOne({ cnic });
  if (cnicExist) {
    throw new ApiError(400, "CNIC already exists");
  }

  const tenant = new Tenant({
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

  await tenant.save();
  return res.status(201).json(new ApiResponse(200, { tenant }, "Tenant added"));
});

// @route   GET /api/tenant/all
// @desc    Get all tenants
// @access  Private
export const showTenants = asyncHandler(async (_, res) => {
  const tenants = await Tenant.find().populate("createdBy", "name -_id");
  return res
    .status(200)
    .json(new ApiResponse(200, { tenants }, "Tenants found"));
});
