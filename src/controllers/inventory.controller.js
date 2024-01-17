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
      { createdBy: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination logic
  const startIndex = (page - 1) * parseInt(limit);
  const endIndex = page * parseInt(limit);

  const inventories = await Inventory.aggregate([
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
              purchaseDate: "$purchaseDate",
            },
          },
          {
            $project: {
              _id: 0,
              ownerId: 1,
              ownerName: 1,
              isActive: 1,
              purchaseDate: 1,
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
        "ownerInventory.ownerName": 1,
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
export const inventoryOpenForSell = asyncHandler(async (req, res) => {
  const { search, limit = 5, page = 1 } = req.query;
  const match = {};
  if (search) {
    match.$or = [
      {
        inventoryType: {
          $regex: search,
          $options: "i",
        },
      },
      {
        floor: {
          $regex: search,
          $options: "i",
        },
      },
      {
        flatNo: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Pagination logic
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const inventoriesForSell = await Inventory.aggregate([
    {
      $facet: {
        inventories: [
          {
            $match: {
              status: "for sell",
            },
          },
          {
            $project: {
              _id: 1,
              inventoryType: 1,
              floor: 1,
              flatNo: 1,
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
        count: [
          {
            $match: {
              status: "for sell",
            },
          },
          {
            $match: match,
          },
          {
            $count: "totalInventories",
          },
        ],
        allInventoriesCount: [
          {
            $match: {
              status: "for sell",
            },
          },
          {
            $count: "totalInventories",
          },
        ],
      },
    },
  ]);

  const openForSellInventories = {
    inventories: inventoriesForSell[0] ? inventoriesForSell[0].inventories : [],
    count: inventoriesForSell[0].count[0]
      ? inventoriesForSell[0].count[0].totalInventories
      : 0,
    allInventoriesCount: inventoriesForSell[0].allInventoriesCount[0]
      ? inventoriesForSell[0].allInventoriesCount[0].totalInventories
      : 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, { openForSellInventories }, "Inventories found")
    );
});

// @route   GET /api/inventory/vacant-inventories
// @desc    Get vacant inventories
// @access  Private
export const vacantInventories = asyncHandler(async (req, res) => {
  const { search, limit = 5, page = 1 } = req.query;
  const match = {};
  if (search) {
    match.$or = [
      {
        inventoryType: {
          $regex: search,
          $options: "i",
        },
      },
      {
        floor: {
          $regex: search,
          $options: "i",
        },
      },
      {
        flatNo: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // Pagination logic
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const aggregatedData = await Inventory.aggregate([
    {
      $facet: {
        vacantInventories: [
          {
            $match: {
              status: "vacant",
            },
          },
          {
            $project: {
              _id: 1,
              inventoryType: 1,
              floor: 1,
              flatNo: 1,
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
        count: [
          {
            $match: {
              status: "vacant",
            },
          },
          {
            $match: match,
          },
          {
            $count: "totalInventories",
          },
        ],
        flatCount: [
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
            $count: "totalFlatInventories",
          },
        ],
        officeCount: [
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
            $count: "totalOfficeInventories",
          },
        ],
        shopCount: [
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
            $count: "totalShopInventories",
          },
        ],
      },
    },
  ]);

  const vacantInventories = {
    inventories: aggregatedData[0] ? aggregatedData[0].vacantInventories : [],
    count: aggregatedData[0].count[0]
      ? aggregatedData[0].count[0].totalInventories
      : 0,
    totalFlatInventories: aggregatedData[0].flatCount[0]
      ? aggregatedData[0].flatCount[0].totalFlatInventories
      : 0,
    totalOfficeInventories: aggregatedData[0].officeCount[0]
      ? aggregatedData[0].officeCount[0].totalOfficeInventories
      : 0,
    totalShopInventories: aggregatedData[0].shopCount[0]
      ? aggregatedData[0].shopCount[0].totalShopInventories
      : 0,
  };

  return res.status(200).json(
    new ApiResponse(200, {
      vacantInventories,
    })
  );
});

// @route   GET /api/inventory/sold-inventories/all
// @desc    Get all sold inventories
// @access  Private
export const soldInventories = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 5 } = req.query;

  // Define the match object for search
  const match = {};
  if (search) {
    match.$or = [
      { inventoryType: { $regex: search, $options: "i" } },
      { floor: { $regex: search, $options: "i" } },
      { flatNo: { $regex: search, $options: "i" } },
      { createdBy: { $regex: search, $options: "i" } },
      { "ownerInventory.ownerName": { $regex: search, $options: "i" } },
    ];
  }

  // Pagination logic
  const startIndex = (page - 1) * parseInt(limit);
  const endIndex = page * parseInt(limit);
  const showSoldInventories = await Inventory.aggregate([
    {
      $match: {
        status: "sold",
      },
    },
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
              purchaseDate: "$purchaseDate",
            },
          },
          {
            $project: {
              _id: 0,
              ownerId: 1,
              ownerName: 1,
              isActive: 1,
              purchaseDate: 1,
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
        inventoryType: 1,
        floor: 1,
        flatNo: 1,
        createdBy: 1,
        "ownerInventory.ownerId": 1,
        "ownerInventory.ownerName": 1,
        "ownerInventory.purchaseDate": 1,
      },
    },
    {
      $match: {
        ownerInventory: { $ne: [] },
      },
    },
    {
      $match: match, // Add the match object for search
    },
    {
      $skip: startIndex, // Pagination: Skip documents
    },
    {
      $limit: parseInt(limit), // Pagination: Limit documents per page
    },
  ]);

  const total = await Inventory.find({
    $and: [
      {
        status: "sold",
      },
      match,
    ],
  }).count();

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
        { showSoldInventories, pagination, totalSoldInventory: total },
        "Inventories found"
      )
    );
});

// @route   PATCH /api/inventory/update-status/:id
// @desc    Update inventory status
// @access  Private
export const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  await Inventory.findByIdAndUpdate(id, { status }, { new: true });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Inventory status updated"));
});
