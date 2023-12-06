import chalk from "chalk";
import Owner from "../models/owner.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";
import fileArray from "../utils/upload_images.utils.js";

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
    inventory,
  } = req.body;

  const { id } = req.user;
  try {
    const phoneNumbers = mappingArray(phoneNumber);
    const emergencyNumbers = mappingArray(emergencyNumber);
    const whatsappNumbers = mappingArray(whatsapp);
    const inventories = mappingArray(inventory);

    // upload images
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
      inventory: inventories,
      createdBy: id,
    });

    await owner.save();
    return res.status(201).json({ message: "Owner added successfully", owner });
  } catch (error) {
    console.log(chalk.redBright.bold(error));
    return res.status(500).json({ message: error.message });
  }
};
