import multer from "multer";

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (_req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid file type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (_req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const convertedFileName = fileName.toLowerCase().split(".");
    const nameBeforeDot = convertedFileName[0];
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${nameBeforeDot}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

export default upload;
