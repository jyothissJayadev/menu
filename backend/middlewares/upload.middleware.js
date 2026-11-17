// backend/middlewares/upload.middleware.js
import multer from "multer";

// Use memory storage so we can directly stream buffer to Cloudinary / Cloudflare R2
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow all standard image types
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, WebP, GIF, SVG, etc.) are allowed!"), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum file size
  },
  fileFilter,
});
