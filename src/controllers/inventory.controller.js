import Inventory from "../models/inventory.model.js";
import Owner from "../models/owner.model.js";
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

// @route   PUT /api/inventory/sell
// @desc    Sell inventory
// @access  Private
export const sellInventory = asyncHandler(async (req, res) => {
  const { owners, inventories } = req.body;
  const status = "sold";

  const inventoriesArray = mappingArray(inventories);
  const ownersArray = mappingArray(owners);

  for (const mappedOwner of ownersArray) {
    const { owner } = mappedOwner;
    await Owner.findByIdAndUpdate(
      owner,
      {
        $addToSet: { inventories: { $each: inventoriesArray } },
      },
      { new: true }
    );
  }

  // update owners and tenants ids in inventory model
  for (const newInventory of inventories) {
    const { inventory } = newInventory;
    await Inventory.findByIdAndUpdate(
      inventory,
      {
        $addToSet: { owners: { $each: ownersArray } },
        $set: { status },
      },
      { new: true }
    );
  }

  res.status(200).json(new ApiResponse(200, {}, "Inventory sold"));
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

// @route   GET /api/inventory/show-owners
// @desc    Get all owners with their inventories
// @access  Private
export const shownInventoriesWithOwners = asyncHandler(
  async (_, res) => {
    const inventoriesWithOwners = await Inventory.aggregate([
      {
        $lookup: {
          from: "owners",
          localField: "owners.owner",
          foreignField: "_id",
          as: "owners",
        },
      },
      {
        $project: {
          inventoryType: 1,
          floor: 1,
          flatNo: 1,
          purchaseDate: 1,
          "owners._id": 1,
          "owners.name": 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, { inventoriesWithOwners }, "Owners found"));
  }
);
