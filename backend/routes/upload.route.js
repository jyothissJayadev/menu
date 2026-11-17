// backend/routes/upload.route.js
import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadImage } from "../utils/cloudStorage.js";

const router = express.Router({ mergeParams: true });

/**
 * POST /api/upload
 * Multi-part file upload using multer and cloud storage (Cloudinary / R2)
 */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded. Key 'image' expected." });
    }

    const folder = req.body.folder || (req.companyId ? `companies/${req.companyId}/cakes` : "cakes");
    const result = await uploadImage(req.file, folder);

    res.json({
      success: true,
      url: result.url,
      provider: result.provider,
      fileName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message || "Failed to upload image" });
  }
});

export default router;
