import sharp from "sharp";
import fs from "fs";
import path from "path";

export const processImage = async (
  buffer: Buffer,
  filename: string
) => {
  const highDir = "uploads/high";
  const lowDir = "uploads/low";

  fs.mkdirSync(highDir, { recursive: true });
  fs.mkdirSync(lowDir, { recursive: true });

  const highPath = path.join(highDir, `${filename}.jpg`);
  const lowPath = path.join(lowDir, `${filename}.jpg`);

  // HIGH QUALITY
  await sharp(buffer)
    .jpeg({ quality: 90 })
    .toFile(highPath);

  // LOW QUALITY
  await sharp(buffer)
    .resize({ width: 400 })
    .jpeg({ quality: 40 })
    .toFile(lowPath);

  return {
    high: `/${highPath}`,
    low: `/${lowPath}`,
  };
};
