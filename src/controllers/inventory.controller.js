import mongoose from "mongoose";
import Inventory from "../models/inventory.model.js";
import SellInventory from "../models/sell_inventory.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

// @route   POST /api/inventory/add
// @desc    Add new inventory
// @access  Private
export const addInventory = asyncHandler(async (req, res) => {
  const { inventoryType, floor, flatNo } = req.body;
  const { _id: id } = req.user;
  const inventory = new Inventory({
    inventoryType,
    floor,
    flatNo,
    createdBy: id,
  });
  await inventory.save();
  return res
    .status(201)
    .json(new ApiResponse(200, { inventory }, "Inventory added"));
});

// @route   POST /api/inventory/sell
// @desc    Sell inventory
// @access  Private
export const sellInventory = asyncHandler(async (req, res) => {
  const { ownerId, inventoryId, purchaseDate } = req.body;

  const sellInventory = new SellInventory({
    ownerId,
    inventoryId,
    purchaseDate,
  });

  await sellInventory.save();

  await Inventory.findByIdAndUpdate(inventoryId, { status: "sold" });

  return res
    .status(201)
    .json(new ApiResponse(200, { sellInventory }, "Inventory sold"));
});

// @route   GET /api/inventory/all
// @desc    Get all inventories
// @access  Private
export const showInventories = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 3 } = req.query;

  // Define the match object for search
  const match = {};
  if (search) {
    match.$or = [
      { inventoryType: { $regex: search, $options: "i" } },
      { floor: { $regex: search, $options: "i" } },
      { flatNo: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
      { createdBy: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const inventories = await Inventory.aggregate([
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
        inventoryType: 1,
        floor: 1,
        flatNo: 1,
        status: 1,
        createdBy: 1,
        createdAt: 1,
      },
    },
    {
      $skip: startIndex, // Pagination: Skip documents
    },
    {
      $limit: limit, // Pagination: Limit documents per page
    },
  ]);

  // Pagination result
  const pagination = {};
  if (endIndex < (await Inventory.countDocuments().exec())) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { inventories, pagination }, "Inventories found")
    );
});

// @route   GET /api/inventory/:id
// @desc    Get inventory details
// @access  Private
export const showInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const inventory = await Inventory.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "sellinventories",
        localField: "_id",
        foreignField: "inventoryId",
        as: "sellInventory",
        pipeline: [
          {
            $lookup: {
              from: "owners",
              localField: "ownerId",
              foreignField: "_id",
              as: "owners",
            },
          },
          {
            $unwind: "$owners",
          },
          {
            $addFields: {
              ownerName: "$owners.name",
            },
          },
          {
            $project: {
              _id: 1,
              purchaseDate: 1,
              ownerName: 1,
              isActive: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        inventoryType: 1,
        floor: 1,
        flatNo: 1,
        status: 1,
        "sellInventory._id": 1,
        "sellInventory.purchaseDate": 1,
        "sellInventory.ownerName": 1,
        "sellInventory.ownerName": 1,
        "sellInventory.isActive": 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, { inventory: inventory[0] }, "Inventory found"));
});

// @route   GET /api/inventory/show-inventories-with-owners
// @desc    Get all owners with their inventories
// @access  Private
export const shownInventoriesWithOwners = asyncHandler(async (_, res) => {
  const inventoriesWithOwners = await Inventory.aggregate([
    {
      $lookup: {
        from: "sellinventories", // Name of the OwnerInventory collection
        localField: "_id", // Field from the Inventory collection
        foreignField: "inventoryId", // Field from the OwnerInventory collection
        as: "ownerInventory",
      },
    },
    {
      $lookup: {
        from: "owners", // Name of the Owner collection
        localField: "ownerInventory.ownerId", // Field from the OwnerInventory collection
        foreignField: "_id", // Field from the Owner collection
        as: "owners",
      },
    },
    {
      $project: {
        _id: 1,
        inventoryType: 1,
        floor: 1,
        flatNo: 1,
        status: 1,
        createdBy: 1,
        owners: {
          _id: 1,
          name: 1,
        },
        createdAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { inventoriesWithOwners }, "Owners found"));
});
