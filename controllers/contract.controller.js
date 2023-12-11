import mongoose from "mongoose";
import Contract from "../models/contract.model.js";
import Inventory from "../models/inventory.model.js";
import Owner from "../models/owner.model.js";
import Tenant from "../models/tenant.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";
import fileArray from "../utils/upload_images.utils.js";

// @route   POST /api/contract/add
// @desc    Add new contract
// @access  Private
export const addContract = async (req, res) => {
  const {
    tenants,
    inventories,
    owners,
    signingDate,
    startDate,
    endDate,
    renewalDate,
    monthlyRentalAmount,
    monthlyTaxAmount,
    buildingManagementCharges,
    securityDepositAmount,
    annualRentalIncrease,
    wapdaSubmeterReading,
    generatorSubmeterReading,
    waterSubmeterReading,
    monthlyRentalDueDate,
    monthlyRentalOverDate,
    agent,
    terminationNoticePeriod,
    nonrefundableSecurityDeposit,
    remarks,
  } = req.body;

  const { id } = req.user;
  try {
    const inventoryArray = mappingArray(inventories);
    const ownerArray = mappingArray(owners);
    const tenantArray = mappingArray(tenants);

    // Check inventories ObjectId is valid
    for (const inventory of inventoryArray) {
      if (!mongoose.Types.ObjectId.isValid(inventory)) {
        return res.status(400).json({ message: "Invalid inventory id" });
      }
    }

    // Check owners ObjectId is valid
    for (const owner of ownerArray) {
      if (!mongoose.Types.ObjectId.isValid(owner)) {
        return res.status(400).json({ message: "Invalid owner id" });
      }
    }

    // Check tenants ObjectId is valid
    for (const tenant of tenantArray) {
      if (!mongoose.Types.ObjectId.isValid(tenant)) {
        return res.status(400).json({ message: "Invalid tenant id" });
      }
    }

    // Check agent ObjectId is valid
    if (!mongoose.Types.ObjectId.isValid(agent)) {
      return res.status(400).json({ message: "Invalid agent id" });
    }

    // Upload images
    const files = req.files;

    // https://domainname.com/uploads/filename-dfse3453ds.jpeg
    const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

    const imagesArray = fileArray(files, basePath);

    const contract = new Contract({
      tenants: tenantArray,
      inventories: inventoryArray,
      owners: ownerArray,
      signingDate,
      startDate,
      endDate,
      renewalDate,
      monthlyRentalAmount,
      monthlyTaxAmount,
      buildingManagementCharges,
      securityDepositAmount,
      annualRentalIncrease,
      wapdaSubmeterReading,
      generatorSubmeterReading,
      waterSubmeterReading,
      monthlyRentalDueDate,
      monthlyRentalOverDate,
      agent,
      terminationNoticePeriod,
      nonrefundableSecurityDeposit,
      remarks,
      images: imagesArray,
      createdBy: id,
    });

    const createdContract = await contract.save();

    // Update inventory status and contracts
    const updatedInventoryStatus = "rented";

    for (const inventory of inventoryArray) {
      await Inventory.findByIdAndUpdate(
        inventory,
        {
          $addToSet: { contracts: createdContract._id, tenants: tenantArray },
          $set: { status: updatedInventoryStatus },
        },
        { new: true }
      );
    }

    // Update owner and tenant contracts
    for (const owner of ownerArray) {
      await Owner.findByIdAndUpdate(
        owner,
        {
          $addToSet: { contracts: createdContract._id },
        },
        { new: true }
      );
    }

    for (const tenant of tenantArray) {
      await Tenant.findByIdAndUpdate(
        tenant,
        {
          $addToSet: {
            contracts: createdContract._id,
            inventories: inventoryArray,
          },
        },
        { new: true }
      );
    }

    res.status(201).json({
      message: "Contract added successfully",
      contract: createdContract,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
