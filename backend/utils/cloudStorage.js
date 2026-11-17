// backend/utils/cloudStorage.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env variables are loaded even with ESM import hoisting
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { v2 as cloudinary } from "cloudinary";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

/**
 * Configure and get Cloudinary instance if credentials exist
 */
function getCloudinary() {
  const url = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (url) {
    cloudinary.config({ cloudinary_url: url, secure: true });
    return cloudinary;
  }
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return cloudinary;
  }
  return null;
}

/**
 * Configure and get S3 / R2 Client if credentials exist
 */
function getR2Client() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;
  const bucket = process.env.R2_BUCKET_NAME;

  if (accessKeyId && secretAccessKey && endpoint && bucket) {
    return new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return null;
}

/**
 * Upload buffer directly to Cloudinary
 */
export async function uploadToCloudinary(buffer, originalname = "cake.jpg", folder = "lavino_cakes") {
  return new Promise((resolve, reject) => {
    const cleanName = path.parse(originalname).name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${cleanName}_${Date.now()}`,
        resource_type: "image",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url || result.url,
          public_id: result.public_id,
          provider: "cloudinary",
          bytes: result.bytes,
          format: result.format,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Upload buffer directly to Cloudflare R2
 */
export async function uploadToR2(buffer, originalname = "cake.jpg", mimetype = "image/jpeg", folder = "cakes") {
  const s3 = getR2Client();
  if (!s3) throw new Error("Cloudflare R2 is not configured");

  const cleanExt = path.extname(originalname) || ".jpg";
  const cleanBase = path.parse(originalname).name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const key = `${folder}/${Date.now()}-${cleanBase}${cleanExt}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  });

  await s3.send(command);

  const publicBase = (process.env.R2_PUBLIC_BASE_URL || "").replace(/\/$/, "");
  const url = publicBase
    ? `${publicBase}/${key}`
    : `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${key}`;

  return {
    url,
    key,
    provider: "cloudflare_r2",
    size: buffer.length,
    mimetype,
  };
}

/**
 * Fallback to local storage if neither cloud service is available
 */
export async function uploadToLocal(buffer, originalname = "cake.jpg") {
  const uploadsDir = path.resolve(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const cleanExt = path.extname(originalname) || ".jpg";
  const cleanBase = path.parse(originalname).name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${Date.now()}-${cleanBase}${cleanExt}`;
  const filePath = path.join(uploadsDir, fileName);

  await fs.promises.writeFile(filePath, buffer);

  const port = process.env.PORT || 4000;
  return {
    url: `http://localhost:${port}/uploads/${fileName}`,
    fileName,
    provider: "local",
    size: buffer.length,
  };
}

/**
 * Universal Image Uploader:
 * 1. Checks if Cloudinary is configured -> uploads to Cloudinary
 * 2. Checks if Cloudflare R2 is configured -> uploads to Cloudflare R2
 * 3. Fallbacks to local disk storage
 */
export async function uploadImage(file, folder = "cakes") {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided for upload");
  }

  const { buffer, originalname, mimetype } = file;

  const cld = getCloudinary();
  if (cld) {
    try {
      console.log("Uploading image to Cloudinary...");
      return await uploadToCloudinary(buffer, originalname, folder);
    } catch (err) {
      console.warn("Cloudinary upload failed, checking R2 fallback:", err.message);
    }
  }

  const r2 = getR2Client();
  if (r2) {
    try {
      console.log("Uploading image to Cloudflare R2...");
      return await uploadToR2(buffer, originalname, mimetype, folder);
    } catch (err) {
      console.warn("R2 upload failed, fallback to local:", err.message);
    }
  }

  console.log("Using local upload storage fallback...");
  return await uploadToLocal(buffer, originalname);
}

export { cloudinary };
