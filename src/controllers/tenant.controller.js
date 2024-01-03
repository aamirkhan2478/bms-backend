import Tenant from "../models/tenant.model.js";
import mongoose from "mongoose";
// import { ApiError } from "../utils/ApiError.js";
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

  const imagesArray = await fileArray(files, basePath);

  // Check if CNIC already exists
  const cnicExist = await Tenant.findOne({ cnic });
  if (cnicExist) {
    res.status(400).json(new ApiResponse(400, {}, "CNIC already exists"));
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
export const showTenants = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 5 } = req.query;

  // Define the match object for search
  const match = {};
  if (search) {
    match.$or = [
      { name: { $regex: search, $options: "i" } },
      { father: { $regex: search, $options: "i" } },
      { cnic: { $regex: search, $options: "i" } },
      { phoneNumber: { $regex: search, $options: "i" } },
      { whatsapp: { $regex: search, $options: "i" } },
      { createdBy: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination logic
  const startIndex = (page - 1) * parseInt(limit);
  const endIndex = page * parseInt(limit);

  const tenants = await Tenant.aggregate([
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
      $addFields: {
        createdBy: "$createdBy.name",
      },
    },
    {
      $match: match, // Add the match object for search
    },
    {
      $project: {
        name: 1,
        father: 1,
        cnic: 1,
        phoneNumber: 1,
        whatsapp: 1,
        createdBy: 1,
        createdAt: 1,
      },
    },
    {
      $skip: startIndex, // Pagination: Skip documents
    },
    {
      $limit: parseInt(limit), // Pagination: Limit documents per page
    },
  ]);

  const total = await Tenant.find(match).count();

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: parseInt(limit),
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: parseInt(limit),
    };
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tenants, totalTenants: total, pagination },
        "Tenants found"
      )
    );
});

// @route   GET /api/tenant/:id
// @desc    Get single tenant
// @access  Private

export const showTenant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tenant = await Tenant.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "rentalinventories",
        localField: "_id",
        foreignField: "tenantId",
        as: "inventories",
        pipeline: [
          {
            $lookup: {
              from: "inventories",
              localField: "inventoryId",
              foreignField: "_id",
              as: "inventory",
            },
          },
          {
            $unwind: "$inventory",
          },
          {
            $addFields: {
              inventoryType: "$inventory.inventoryType",
              floor: "$inventory.floor",
              flatNo: "$inventory.flatNo",
            },
          },
          {
            $project: {
              _id: 1,
              inventoryType: 1,
              floor: 1,
              flatNo: 1,
              isActive: 1,
            },
          },
        ],
      },
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
        bankName: 1,
        bankTitle: 1,
        bankBranchAddress: 1,
        bankAccountNumber: 1,
        bankIbnNumber: 1,
        images: 1,
        remarks: 1,
        "inventories._id": 1,
        "inventories.inventoryType": 1,
        "inventories.floor": 1,
        "inventories.flatNo": 1,
        "inventories.isActive": 1,
      },
    },
  ]);

  if (!tenant) {
    res.status(404).json(new ApiResponse(404, {}, "Tenant not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { tenant: tenant[0] }, "Tenant found"));
});

// @route   PATCH /api/tenant/:id/update
// @desc    Update tenant
// @access  Private
export const updateTenant = asyncHandler(async (req, res) => {
  const { id } = req.params;
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
    bankName,
    bankTitle,
    bankBranchAddress,
    bankAccountNumber,
    bankIbnNumber,
    remarks,
  } = req.body;

  const phoneNumbers = mappingArray(phoneNumber);
  const emergencyNumbers = mappingArray(emergencyNumber);
  const whatsappNumbers = mappingArray(whatsapp);

  const tenant = await Tenant.findById(id);

  if (!tenant) {
    res.status(404).json(new ApiResponse(404, {}, "Tenant not found"));
  }

  tenant.name = name;
  tenant.father = father;
  tenant.cnic = cnic;
  tenant.cnicExpiry = cnicExpiry;
  tenant.phoneNumber = phoneNumbers;
  tenant.emergencyNumber = emergencyNumbers;
  tenant.whatsapp = whatsappNumbers;
  tenant.email = email;
  tenant.currentAddress = currentAddress;
  tenant.permanentAddress = permanentAddress;
  tenant.jobTitle = jobTitle;
  tenant.jobLocation = jobLocation;
  tenant.jobOrganization = jobOrganization;
  tenant.bankName = bankName;
  tenant.bankTitle = bankTitle;
  tenant.bankBranchAddress = bankBranchAddress;
  tenant.bankAccountNumber = bankAccountNumber;
  tenant.bankIbnNumber = bankIbnNumber;
  tenant.remarks = remarks;

  await tenant.save();
  return res.status(200).json(new ApiResponse(200, {}, "Tenant updated"));
});

// @route   PATCH /api/tenant/:id/update-images
// @desc    Update tenant images
// @access  Private
export const updateImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const files = req.files;

  // https://domainname.com/uploads/filename-dfse3453ds.jpeg
  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  const imagesArray = await fileArray(files, basePath);

  const tenant = await Tenant.findById(id);
  if (!tenant) {
    res.status(404).json(new ApiResponse(404, {}, "Tenant not found"));
  }

  tenant.images = imagesArray;

  await tenant.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tenant images updated"));
});
