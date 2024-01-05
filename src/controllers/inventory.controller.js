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

  const owner = await SellInventory.findOne({
    ownerId,
    inventoryId,
  });

  if (owner && owner.isActive === true) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Inventory already sold to this owner"));
  }

  if (owner && owner.isActive === false) {
    await SellInventory.findOneAndUpdate(
      { ownerId, inventoryId },
      { isActive: true }
    );

    await Inventory.findByIdAndUpdate(inventoryId, { status: "sold" });

    return res
      .status(201)
      .json(new ApiResponse(200, {}, "Inventory sold to owner again"));
  }

  const sellInventory = new SellInventory({
    ownerId,
    inventoryId,
    purchaseDate,
  });

  await sellInventory.save();

  await Inventory.findByIdAndUpdate(inventoryId, { status: "sold" });

  return res.status(201).json(new ApiResponse(200, {}, "Inventory sold"));
});

// @route   GET /api/inventory/all
// @desc    Get all inventories
// @access  Private
export const showInventories = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 5 } = req.query;

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
  const startIndex = (page - 1) * parseInt(limit);
  const endIndex = page * parseInt(limit);

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
      $limit: parseInt(limit), // Pagination: Limit documents per page
    },
  ]);

  const total = await Inventory.find(match).count();
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
        { inventories, pagination, totalInventory: total },
        "Inventories found"
      )
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
        as: "owners",
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
        inventoryType: 1,
        floor: 1,
        flatNo: 1,
        status: 1,
        "owners._id": 1,
        "owners.purchaseDate": 1,
        "owners.ownerName": 1,
        "owners.ownerName": 1,
        "owners.isActive": 1,
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
        pipeline: [
          {
            $lookup: {
              from: "owners", // Name of the Owner collection
              localField: "ownerId", // Field from the OwnerInventory collection
              foreignField: "_id", // Field from the Owner collection
              as: "owners",
            },
          },
          {
            $unwind: "$owners",
          },
          {
            $addFields: {
              ownerId: "$owners._id",
              ownerName: "$owners.name",
            },
          },
          {
            $project: {
              _id: 0,
              ownerId: 1,
              ownerName: 1,
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
        _id: 1,
        inventoryType: 1,
        floor: 1,
        flatNo: 1,
        "ownerInventory.ownerId": 1,
        "ownerInventory.ownerName": 1,
      },
    },
    {
      $match: {
        ownerInventory: { $ne: [] },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, { inventoriesWithOwners }, "Owners found"));
});

// @route   GET /api/inventory/:id/update
// @desc    Update inventory
// @access  Private
export const updateInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { inventoryType, floor, flatNo } = req.body;
  await Inventory.findByIdAndUpdate(
    id,
    { inventoryType, floor, flatNo },
    { new: true }
  );
  return res.status(200).json(new ApiResponse(200, {}, "Inventory updated"));
});

// @route   GET /api/inventory/open-for-sale
// @desc    Get how many inventories that are open for sale
// @access  Private
export const inventoryOpenForSell = asyncHandler(async (_, res) => {
  const inventoriesForSell = await Inventory.aggregate([
    {
      $match: {
        status: "for sell",
      },
    },
    {
      $group: {
        _id: null,
        totalInventories: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalInventories: 1,
      },
    },
  ]);

  const totalInventories = inventoriesForSell[0]
    ? inventoriesForSell[0].totalInventories
    : 0;

  return res
    .status(200)
    .json(new ApiResponse(200, { totalInventories }, "Inventories found"));
});

// @route   GET /api/inventory/vacant-inventories
// @desc    Get vacant inventories
// @access  Private
export const vacantInventories = asyncHandler(async (_, res) => {
  const vacantFlatInventories = await Inventory.aggregate([
    {
      $match: {
        $and: [
          {
            inventoryType: "Flat",
          },
          {
            status: "vacant",
          },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalFlatInventories: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalFlatInventories: 1,
      },
    },
  ]);

  const vacantShopInventories = await Inventory.aggregate([
    {
      $match: {
        $and: [
          {
            inventoryType: "Shop",
          },
          {
            status: "vacant",
          },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalShopInventories: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalShopInventories: 1,
      },
    },
  ]);

  const vacantOfficeInventories = await Inventory.aggregate([
    {
      $match: {
        $and: [
          {
            inventoryType: "Office",
          },
          {
            status: "vacant",
          },
        ],
      },
    },
    {
      $group: {
        _id: null,
        totalOfficeInventories: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalOfficeInventories: 1,
      },
    },
  ]);

  const vacantOfficeInventoriesCount = vacantOfficeInventories[0]
    ? vacantOfficeInventories[0].totalOfficeInventories
    : 0;
  const vacantShopInventoriesCount = vacantShopInventories[0]
    ? vacantShopInventories[0].totalShopInventories
    : 0;
  const vacantFlatInventoriesCount = vacantFlatInventories[0]
    ? vacantFlatInventories[0].totalFlatInventories
    : 0;

  return res.status(200).json(
    new ApiResponse(200, {
      vacantOfficeInventoriesCount,
      vacantShopInventoriesCount,
      vacantFlatInventoriesCount,
    })
  );
});
