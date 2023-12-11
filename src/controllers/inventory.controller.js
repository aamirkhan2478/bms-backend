import Inventory from "../models/inventory.model.js";
import Owner from "../models/owner.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";

// @route   POST /api/inventory/add
// @desc    Add new inventory
// @access  Private
export const addInventory = async (req, res) => {
  const { inventoryType, floor, flatNo } = req.body;
  const { id } = req.user;
  try {
    const inventory = new Inventory({
      inventoryType,
      floor,
      flatNo,
      createdBy: id,
    });
    await inventory.save();
    return res.status(201).json({ message: "Inventory added successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/inventory/sell
// @desc    Sell inventory
// @access  Private
export const sellInventory = async (req, res) => {
  try {
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

    res.status(200).json({ message: "Inventory sold successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/inventory/show-owners
// @desc    Get all owners with their inventories
// @access  Private
export const showOwnersWithSpecificInventories = async (_req, res) => {
  try {
    const owners = await Inventory.find()
      .populate("owners", "name _id")
      .select("owners");

    return res.status(200).json({ allData: owners });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
