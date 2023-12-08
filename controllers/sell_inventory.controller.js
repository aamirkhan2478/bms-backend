import Inventory from "../models/inventory.model.js";
import Owner from "../models/owner.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";

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
