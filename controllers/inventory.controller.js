import Inventory from "../models/inventory.model.js";

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
