import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/temp")); // Specify the directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`); // Create a unique filename using the current timestamp and original name
  },
});

// Create a multer instance with the storage configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Set a file size limit of 5MB
  fileFilter: (req, file, cb) => {
    console.log("File being uploaded:", file); // Debug log
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(file.mimetype);
    if (extname) {
      return cb(null, true);
    }
    console.log("File type not allowed:", file.mimetype); // Debug log
    cb(new Error("Only images are allowed"));
  },
});

export default upload;
