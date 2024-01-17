import mongoose from "mongoose";
import Contract from "../models/contract.model.mjs";
import mappingArray from "../utils/mapping_arrays.utils.mjs";
import fileArray from "../utils/upload_images.utils.mjs";
import asyncHandler from "../utils/AsyncHandler.mjs";
import { ApiResponse } from "../utils/ApiResponse.mjs";
// import { ApiError } from "../utils/ApiError.mjs";
import OwnerSignContract from "../models/owner_sign_contract.model.mjs";
import TenantSignContract from "../models/tenant_sign_contract.model.mjs";
import RentalInventory from "../models/rental_inventory.model.mjs";

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

// @route   GET /api/contract/all
// @desc    Show all contracts
// @access  Private
export const showContracts = asyncHandler(async (req, res) => {
  const { search, limit = 5, page = 1 } = req.query;
  const match = {};
  if (search) {
    match.$or = [
      {
        "inventory.inventoryType": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "inventory.floor": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "inventory.flatNo": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "tenants.name": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "owners.name": {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Pagination logic
  const startIndex = (parseInt(page) - 1) * parseInt(limit);

  const contracts = await Contract.aggregate([
    {
      $lookup: {
        from: "rentalinventories",
        localField: "inventory",
        foreignField: "inventoryId",
        as: "tenants",
        pipeline: [
          {
            $lookup: {
              from: "tenants",
              localField: "tenantId",
              foreignField: "_id",
              as: "tenant",
            },
          },
          {
            $project: {
              tenant: {
                $arrayElemAt: ["$tenant", 0],
              },
            },
          },
          {
            $addFields: {
              tenantId: "$tenant._id",
              name: "$tenant.name",
            },
          },
          {
            $project: {
              _id: 0,
              tenant: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "ownersigncontracts",
        localField: "_id",
        foreignField: "contractId",
        as: "owners",
        pipeline: [
          {
            $lookup: {
              from: "owners",
              localField: "ownerId",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $project: {
              owner: {
                $arrayElemAt: ["$owner", 0],
              },
            },
          },
          {
            $addFields: {
              ownerId: "$owner._id",
              name: "$owner.name",
            },
          },
          {
            $project: {
              _id: 0,
              owner: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "inventories",
        localField: "inventory",
        foreignField: "_id",
        as: "inventory",
      },
    },
    {
      $addFields: {
        inventory: {
          $arrayElemAt: ["$inventory", 0],
        },
      },
    },
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
      $project: {
        _id: 1,
        createdBy: 1,
        tenants: 1,
        inventory: {
          _id: 1,
          inventoryType: 1,
          floor: 1,
          flatNo: 1,
        },
        owners: 1,
        startDate: 1,
        endDate: 1,
        monthlyRentalAmount: 1,
        buildingManagementCharges: 1,
        securityDepositAmount: 1,
        annualRentalIncrease: 1,
        terminationNoticePeriod: 1,
        createdAt: 1,
      },
    },
    {
      $match: match,
    },
    {
      $skip: startIndex, // Pagination: Skip documents
    },
    {
      $limit: parseInt(limit), // Pagination: Limit documents per page
    },
    {
      $facet: {
        data: [
          {
            $project: {
              _id: 1,
              createdBy: 1,
              tenants: 1,
              inventory: {
                _id: 1,
                inventoryType: 1,
                floor: 1,
                flatNo: 1,
              },
              owners: 1,
              startDate: 1,
              endDate: 1,
              monthlyRentalAmount: 1,
              buildingManagementCharges: 1,
              securityDepositAmount: 1,
              annualRentalIncrease: 1,
              terminationNoticePeriod: 1,
              createdAt: 1,
            },
          },
        ],
        count: [{ $count: "total" }],
      },
    },
  ]);

  const result = {
    contracts: contracts[0].data,
    totalContracts: contracts[0].count[0] ? contracts[0].count[0].total : 0,
  };
  return res.status(200).json(new ApiResponse(200, result));
});

// @route   GET /api/contract/:id/show
// @desc    Show contract
// @access  Private
export const showContract = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json(new ApiResponse(400, {}, "Invalid contract id"));
  }

  const contract = await Contract.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "rentalinventories",
        localField: "inventory",
        foreignField: "inventoryId",
        as: "tenants",
        pipeline: [
          {
            $lookup: {
              from: "tenants",
              localField: "tenantId",
              foreignField: "_id",
              as: "tenant",
            },
          },
          {
            $project: {
              tenant: {
                $arrayElemAt: ["$tenant", 0],
              },
            },
          },
          {
            $addFields: {
              tenantId: "$tenant._id",
              name: "$tenant.name",
            },
          },
          {
            $project: {
              _id: 0,
              tenant: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "ownersigncontracts",
        localField: "_id",
        foreignField: "contractId",
        as: "owners",
        pipeline: [
          {
            $lookup: {
              from: "owners",
              localField: "ownerId",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $project: {
              owner: {
                $arrayElemAt: ["$owner", 0],
              },
            },
          },
          {
            $addFields: {
              ownerId: "$owner._id",
              name: "$owner.name",
            },
          },
          {
            $project: {
              _id: 0,
              owner: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "inventories",
        localField: "inventory",
        foreignField: "_id",
        as: "inventory",
      },
    },
    {
      $addFields: {
        inventory: {
          $arrayElemAt: ["$inventory", 0],
        },
      },
    },
    {
      $lookup: {
        from: "agents",
        localField: "agent",
        foreignField: "_id",
        as: "agent",
      },
    },
    {
      $addFields: {
        agent: {
          $arrayElemAt: ["$agent.name", 0],
        },
      },
    },
    {
      $project: {
        _id: 1,
        tenants: 1,
        inventory: {
          _id: 1,
          inventoryType: 1,
          floor: 1,
          flatNo: 1,
        },
        owners: 1,
        signingDate: 1,
        startDate: 1,
        endDate: 1,
        monthlyRentalAmount: 1,
        buildingManagementCharges: 1,
        securityDepositAmount: 1,
        annualRentalIncrease: 1,
        terminationNoticePeriod: 1,
        nonrefundableSecurityDeposit: 1,
        monthlyRentalDueDate: 1,
        monthlyRentalOverDate: 1,
        wapdaSubmeterReading: 1,
        generatorSubmeterReading: 1,
        waterSubmeterReading: 1,
        monthlyTaxAmount: 1,
        renewalDate: 1,
        agent: 1,
        remarks: 1,
        images: 1,
      },
    },
  ]);

  if (!contract.length) {
    res.status(404).json(new ApiResponse(404, {}, "Contract not found"));
  }

  return res.status(200).json(new ApiResponse(200, contract[0]));
});

// @route   GET /api/contract/contract-dashboard-counts
// @desc    Expired contract
// @access  Private
export const contractDashboardCounts = asyncHandler(async (req, res) => {
  const { search, limit = 5, page = 1 } = req.query;
  const match = {};
  if (search) {
    match.$or = [
      {
        "inventory.inventoryType": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "inventory.floor": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "inventory.flatNo": {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Pagination logic
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const contractData = await Contract.aggregate([
    {
      $facet: {
        expiredContracts: [
          {
            $match: {
              endDate: {
                $lte: new Date(),
              },
            },
          },
          {
            $lookup: {
              from: "inventories",
              localField: "inventory",
              foreignField: "_id",
              as: "inventory",
            },
          },
          {
            $addFields: {
              inventory: {
                $arrayElemAt: ["$inventory", 0],
              },
            },
          },
          {
            $project: {
              _id: 1,
              inventory: {
                _id: 1,
                inventoryType: 1,
                floor: 1,
                flatNo: 1,
              },
              startDate: 1,
              endDate: 1,
            },
          },
          {
            $match: match,
          },
          {
            $skip: startIndex, // Pagination: Skip documents
          },
          {
            $limit: parseInt(limit), // Pagination: Limit documents per page
          },
        ],
        expiredContractsCount: [
          {
            $match: {
              endDate: {
                $lte: new Date(),
              },
            },
          },
          {
            $match: match,
          },
          {
            $count: "total",
          },
        ],
        expiringContracts: [
          {
            $match: {
              endDate: {
                $gte: new Date(),
                $lte: new Date(new Date().setDate(new Date().getDate() + 30)),
              },
            },
          },
          {
            $lookup: {
              from: "inventories",
              localField: "inventory",
              foreignField: "_id",
              as: "inventory",
            },
          },
          {
            $addFields: {
              inventory: {
                $arrayElemAt: ["$inventory", 0],
              },
            },
          },
          {
            $project: {
              _id: 1,
              inventory: {
                _id: 1,
                inventoryType: 1,
                floor: 1,
                flatNo: 1,
              },
              startDate: 1,
              endDate: 1,
            },
          },
          {
            $match: match,
          },
          {
            $skip: startIndex, // Pagination: Skip documents
          },
          {
            $limit: parseInt(limit), // Pagination: Limit documents per page
          },
        ],
        expiringContractsCount: [
          {
            $match: {
              endDate: {
                $gte: new Date(),
                $lte: new Date(new Date().setDate(new Date().getDate() + 30)),
              },
            },
          },
          {
            $match: match,
          },
          {
            $count: "total",
          },
        ],
        uploadedContracts: [
          {
            $match: {
              images: {
                $ne: [],
              },
            },
          },
          {
            $lookup: {
              from: "inventories",
              localField: "inventory",
              foreignField: "_id",
              as: "inventory",
            },
          },
          {
            $addFields: {
              inventory: {
                $arrayElemAt: ["$inventory", 0],
              },
            },
          },
          {
            $project: {
              _id: 1,
              inventory: {
                _id: 1,
                inventoryType: 1,
                floor: 1,
                flatNo: 1,
              },
              startDate: 1,
              endDate: 1,
            },
          },
          {
            $match: match,
          },
          {
            $skip: startIndex, // Pagination: Skip documents
          },
          {
            $limit: parseInt(limit), // Pagination: Limit documents per page
          },
        ],
        uploadedContractsCount: [
          {
            $match: {
              images: {
                $ne: [],
              },
            },
          },
          {
            $match: match,
          },
          {
            $count: "total",
          },
        ],
        expiredAllContractsCount: [
          {
            $match: {
              endDate: {
                $lte: new Date(),
              },
            },
          },
          {
            $count: "total",
          },
        ],
        expiringAllContractsCount: [
          {
            $match: {
              endDate: {
                $gte: new Date(),
                $lte: new Date(new Date().setDate(new Date().getDate() + 30)),
              },
            },
          },
          {
            $count: "total",
          },
        ],
        uploadedAllContractsCount: [
          {
            $match: {
              images: {
                $ne: [],
              },
            },
          },
          {
            $count: "total",
          },
        ],
      },
    },
  ]);

  const expiredContractsData = {
    contracts: contractData[0].expiredContracts ? contractData[0].expiredContracts : [],
    expiredContractsCount: contractData[0].expiredContractsCount[0]
      ? contractData[0].expiredContractsCount[0].total
      : 0,
    expiredAllContractsCount: contractData[0].expiredAllContractsCount[0]
      ? contractData[0].expiredAllContractsCount[0].total
      : 0,
  };
  const expiringContractsData = {
    contracts: contractData[0].expiringContracts  ? contractData[0].expiringContracts : [],
    expiringContractsCount: contractData[0].expiringContractsCount[0]
      ? contractData[0].expiringContractsCount[0].total
      : 0,
    expiringAllContractsCount: contractData[0].expiringAllContractsCount[0]
      ? contractData[0].expiringAllContractsCount[0].total
      : 0,
  };
  const uploadedContractsData = {
    contracts: contractData[0].uploadedContracts ? contractData[0].uploadedContracts : [],
    totalContractUploaded: contractData[0].uploadedContractsCount[0]
      ? contractData[0].uploadedContractsCount[0].total
      : 0,
    totalAllContractUploaded: contractData[0].uploadedAllContractsCount[0]
      ? contractData[0].uploadedAllContractsCount[0].total
      : 0,
  };

  return res.status(200).json(
    new ApiResponse(200, {
      expiringContractsData,
      expiredContractsData,
      uploadedContractsData,
    })
  );
});

// @route   PUT /api/contract/:id/update
// @desc    Update contract
// @access  Private
export const updateContract = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json(new ApiResponse(400, {}, "Invalid contract id"));
  }

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

  const contract = await Contract.findById(id);

  if (!contract) {
    res.status(404).json(new ApiResponse(404, {}, "Contract not found"));
  }

  contract.inventory = inventory;
  contract.signingDate = signingDate;
  contract.startDate = startDate;
  contract.endDate = endDate;
  contract.renewalDate = renewalDate;
  contract.monthlyRentalAmount = monthlyRentalAmount;
  contract.monthlyTaxAmount = monthlyTaxAmount;
  contract.buildingManagementCharges = buildingManagementCharges;
  contract.securityDepositAmount = securityDepositAmount;
  contract.annualRentalIncrease = annualRentalIncrease;
  contract.wapdaSubmeterReading = wapdaSubmeterReading;
  contract.generatorSubmeterReading = generatorSubmeterReading;
  contract.waterSubmeterReading = waterSubmeterReading;
  contract.monthlyRentalDueDate = monthlyRentalDueDate;
  contract.monthlyRentalOverDate = monthlyRentalOverDate;
  contract.agent = agent;
  contract.terminationNoticePeriod = terminationNoticePeriod;
  contract.nonrefundableSecurityDeposit = nonrefundableSecurityDeposit;
  contract.remarks = remarks;

  const updatedContract = await contract.save();

  // Save signed contract to owners and tenants
  await OwnerSignContract.deleteMany({ contractId: id });
  await TenantSignContract.deleteMany({ contractId: id });

  await OwnerSignContract.insertMany(
    owners.map((owner) => ({
      ownerId: owner,
      contractId: updatedContract._id,
    }))
  );

  await TenantSignContract.insertMany(
    tenants.map((tenant) => ({
      tenantId: tenant,
      contractId: updatedContract._id,
    }))
  );

  // Save tenants and inventory to rental inventory
  await RentalInventory.deleteMany({ inventoryId: inventory });
  await RentalInventory.insertMany(
    tenants.map((tenant) => ({
      tenantId: tenant,
      inventoryId: inventory,
    }))
  );

  res.status(200).json(new ApiResponse(200, {}, "Contract updated"));
});

// @route   PATCH /api/contract/:id/update-images
// @desc    Update contract images
// @access  Private
export const updateImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json(new ApiResponse(400, {}, "Invalid contract id"));
  }

  const contract = await Contract.findById(id);

  if (!contract) {
    res.status(404).json(new ApiResponse(404, {}, "Contract not found"));
  }

  // Upload images
  const files = req.files;

  // https://domainname.com/uploads/filename-dfse3453ds.jpeg
  const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

  const imagesArray = await fileArray(files, basePath);

  contract.images = imagesArray;

  await contract.save();

  res.status(200).json(new ApiResponse(200, {}, "Contract images updated"));
});
