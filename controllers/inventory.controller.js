import Inventory from "../models/inventory.model.js";

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
