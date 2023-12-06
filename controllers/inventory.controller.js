import Inventory from "../models/inventory.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";

export const addInventory = async (req, res) => {
  const { inventoryType, floor, flatNo, isSold, status, owners } = req.body;
  const { id } = req.user;
  try {
    const ownersArray = mappingArray(owners);

    const inventory = new Inventory({
      inventoryType,
      floor,
      flatNo,
      isSold,
      status,
      owners: ownersArray,
      createdBy: id,
    });
    await inventory.save();
    return res.status(201).json({ message: "Inventory added successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
