import sharp from "sharp";
import { uploadFile } from "../utils/cloudflareR2.js";

/**
 * Processes an image buffer into high and low quality,
 * uploads both to Cloudflare, and returns the URLs.
 */
export const processImage = async (buffer: Buffer, filename: string) => {
  // HIGH QUALITY
  const highBuffer = await sharp(buffer)
    .jpeg({ quality: 90 })
    .toBuffer();

  const highFile = {
    originalname: `${filename}-high.jpg`,
    buffer: highBuffer,
    mimetype: "image/jpeg",
  } as Express.Multer.File;

  const highUpload = await uploadFile(highFile);

  // LOW QUALITY
  const lowBuffer = await sharp(buffer)
    .resize({ width: 400 })
    .jpeg({ quality: 40 })
    .toBuffer();

  const lowFile = {
    originalname: `${filename}-low.jpg`,
    buffer: lowBuffer,
    mimetype: "image/jpeg",
  } as Express.Multer.File;

  const lowUpload = await uploadFile(lowFile);

  return {
    high: highUpload.Location,
    low: lowUpload.Location,
  };
};
