import Inventory from "../models/inventory.model.js";
import Owner from "../models/owner.model.js";
import SellInventory from "../models/sell_inventory.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import mappingArray from "../utils/mapping_arrays.utils.js";

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

export const showInventories = asyncHandler(async (_, res) => {
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
      $project: {
        inventoryType: 1,
        floor: 1,
        flatNo: 1,
        status: 1,
        purchaseDate: 1,
        owners: 1,
        createdBy: {
          name: 1,
          _id: 1,
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, { inventories }, "Inventories found"));
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
