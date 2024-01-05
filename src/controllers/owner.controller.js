import Owner from "../models/owner.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";
import fileArray from "../utils/upload_images.utils.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
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
export const showOwners = asyncHandler(async (req, res) => {
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

  const total = await Owner.find(match).count();

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
        { owners, totalOwners: total, pagination },
        "Owners found"
      )
    );
});

// @route   GET /api/owner/:id
// @desc    Get owner by id
// @access  Private
export const showOwner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const owner = await Owner.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "sellinventories",
        localField: "_id",
        foreignField: "ownerId",
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
              purchaseDate: 1,
              isActive: 1,
            },
          },
          {
            $match: {
              isActive: true,
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
        "inventories.purchaseDate": 1,
        "inventories.isActive": 1,
      },
    },
  ]);

  if (!owner) {
    res.status(404).json(new ApiResponse(404, {}, "Owner not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { owner: owner[0] }, "Owner found"));
});

// @route   PATCH /api/owner/:id/update-images
// @desc    Update owner images
// @access  Private
export const updateImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const files = req.files;
  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;
  const imagesArray = await fileArray(files, basePath);

  const owner = await Owner.findById(id);
  if (!owner) {
    res.status(404).json(new ApiResponse(404, {}, "Owner not found"));
  }

  owner.images = imagesArray;
  await owner.save();

  return res.status(200).json(new ApiResponse(200, {}, "Owner images updated"));
});

// @route   PATCH /api/owner/:id/update
// @desc    Update owner
// @access  Private
export const updateOwner = asyncHandler(async (req, res) => {
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

  const { id } = req.params;

  const phoneNumbers = mappingArray(phoneNumber);
  const emergencyNumbers = mappingArray(emergencyNumber);
  const whatsappNumbers = mappingArray(whatsapp);

  const owner = await Owner.findById(id);
  if (!owner) {
    res.status(404).json(new ApiResponse(404, {}, "Owner not found"));
  }

  owner.name = name;
  owner.father = father;
  owner.cnic = cnic;
  owner.cnicExpiry = cnicExpiry;
  owner.phoneNumber = phoneNumbers;
  owner.emergencyNumber = emergencyNumbers;
  owner.whatsapp = whatsappNumbers;
  owner.email = email;
  owner.currentAddress = currentAddress;
  owner.permanentAddress = permanentAddress;
  owner.jobTitle = jobTitle;
  owner.jobLocation = jobLocation;
  owner.jobOrganization = jobOrganization;
  owner.bankName = bankName;
  owner.bankTitle = bankTitle;
  owner.bankBranchAddress = bankBranchAddress;
  owner.bankAccountNumber = bankAccountNumber;
  owner.bankIbnNumber = bankIbnNumber;
  owner.remarks = remarks;

  await owner.save();

  return res.status(200).json(new ApiResponse(200, {}, "Owner updated"));
});

// @route   GET /api/owner/expired-cnic
// @desc    Get expired CNIC
// @access  Private
export const expiredCnic = asyncHandler(async (_, res) => {
  const cnicExpiryCount = await Owner.aggregate([
    {
      $match: {
        cnicExpiry: {
          $lte: new Date(),
        },
      },
    },
    {
      $count: "expiredCnicCount",
    },
  ]);

  const expiredCnicCount = cnicExpiryCount[0]
    ? cnicExpiryCount[0].expiredCnicCount
    : 0;

  return res.status(200).json(
    new ApiResponse(200, {
      expiredCnicCount,
    })
  );
});
