import chalk from "chalk";
import Tenant from "../models/tenant.model.js";
import mappingArray from "../utils/mapping_arrays.utils.js";
import fileArray from "../utils/upload_images.utils.js";

export const addTenant = async (req, res) => {
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

    // upload images
    const files = req.files;

    // https://domainname.com/uploads/filename-dfse3453ds.jpeg
    const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

    const imagesArray = fileArray(files, basePath);

    // Check if email already exists
    const emailExist = await Tenant.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // Check if CNIC already exists
    const cnicExist = await Tenant.findOne({ cnic });
    if (cnicExist) {
      return res.status(400).json({ message: "CNIC already exists!" });
    }

    const tenant = new Tenant({
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

    await tenant.save();
    return res
      .status(201)
      .json({ message: "Tenant added successfully", tenant });
  } catch (error) {
    console.log(chalk.redBright.bold(error));
    return res.status(500).json({ message: error.message });
  }
};
