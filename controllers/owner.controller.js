import chalk from "chalk";
import Owner from "../models/owner.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";
import fileArray from "../utils/upload_images.utils.js";
import mongoose from "mongoose";
import Inventory from "../models/inventory.model.js";

// @route   POST /api/owner/add
// @desc    Add new owner
// @access  Private
export const addOwner = async (req, res) => {
  const {
    name,
    father,
    cnic,
    cnicExpiry,
    phoneNumber,
    emergencyNumber,
    whatsapp,
    email,
    currentAddress,
    permanentAddress,
    jobTitle,
    jobLocation,
    jobOrganization,
  } = req.body;

  const { id } = req.user;
  try {
    const phoneNumbers = mappingArray(phoneNumber);
    const emergencyNumbers = mappingArray(emergencyNumber);
    const whatsappNumbers = mappingArray(whatsapp);

    // Upload images
    const files = req.files;

    // https://domainname.com/uploads/filename-dfse3453ds.jpeg
    const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

    const imagesArray = fileArray(files, basePath);

    // Check if email already exists
    const emailExist = await Owner.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // Check if CNIC already exists
    const cnicExist = await Owner.findOne({ cnic });
    if (cnicExist) {
      return res.status(400).json({ message: "CNIC already exists!" });
    }

    const owner = new Owner({
      name,
      father,
      cnic,
      cnicExpiry,
      phoneNumber: phoneNumbers,
      emergencyNumber: emergencyNumbers,
      whatsapp: whatsappNumbers,
      email,
      currentAddress,
      permanentAddress,
      jobTitle,
      jobLocation,
      jobOrganization,
      images: imagesArray,
      createdBy: id,
    });

    await owner.save();
    return res.status(201).json({ message: "Owner added successfully", owner });
  } catch (error) {
    console.log(chalk.redBright.bold(error));
    return res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/owner/show-inventories
// @desc    Get all inventories with their owners
// @access  Private
export const showInventoriesWithSpecificOwners = async (req, res) => {
  // Get the owner IDs from the query string
  let { ownerIds } = req.query;

  try {
    // Convert the comma-separated string of IDs to an array
    ownerIds = ownerIds.split(",").map((id) => id.trim());

    // Select only the owner Ids
    const owners = await Owner.find({
      _id: { $in: ownerIds },
    }).select("_id");

    // Extract the owner IDs from the retrieved owners
    const ids = owners.map((owner) => owner._id);

    // Check if any owners were found
    if (ids.length === 0) {
      return res.status(404).json({ message: "No owners found!" });
    }

    // Check the ObjectIds are valid
    if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "Invalid owner IDs!" });
    }

    // Retrieve only the inventories that belong to the specified owners
    const inventories = await Inventory.find({
      owners: { $in: ids },
    }).select("inventoryType floor flatNo");

    return res.status(200).json({ inventories });
  } catch (error) {
    console.log(chalk.redBright.bold(error));
    return res.status(500).json({ message: error.message });
  }
};
