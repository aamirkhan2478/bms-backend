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

  // update inventory id in owner model
  for (const owner of ownersArray) {
    await Owner.findByIdAndUpdate(
      owner,
      {
        $addToSet: { inventories: { $each: inventoriesArray } },
      },
      { new: true }
    );
  }

  // update owners and tenants ids in inventory model
  for (const inventory of inventories) {
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

// @route   GET /api/inventory/show-owners
// @desc    Get all owners with their inventories
// @access  Private
export const showOwnersWithSpecificInventories = asyncHandler(
  async (_, res) => {
    const owners = await Inventory.find()
      .populate("owners", "name _id")
      .select("owners");

    return res
      .status(200)
      .json(new ApiResponse(200, { owners }, "Owners found"));
  }
);
