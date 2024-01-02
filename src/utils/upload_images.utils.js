import fs from "fs";
import path from "path";
import sharp from "sharp";

// Function to upload an array of images
const fileArray = async (files, basePath) => {
  let result = [];
  if (files && Array.isArray(files) && files.length > 0) {
    // Use sharp to compress images
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Compress the image using sharp
      const compressedImageBuffer = await sharp(file.path)
        .jpeg({ quality: 80 })
        .toBuffer();

      // Generate a unique filename for the compressed image
      const compressedFilename = `compressed-${file.filename}`;

      // Create a link for the compressed image
      const compressedImagePath = `${basePath}${compressedFilename}`;

      // Store the link in the result array
      result.push(compressedImagePath);

      // Save the compressed image to the server
      const compressedImagePaths = `public/uploads/${compressedFilename}`;
      fs.writeFileSync(
        path.resolve(compressedImagePaths),
        compressedImageBuffer
      );
    }

    // Delete all original images after compression
    for (let i = 0; i < files.length; i++) {
      fs.unlinkSync(files[i].path);
    }
  }

  return result;
};

export default fileArray;
