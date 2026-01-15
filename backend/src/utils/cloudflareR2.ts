import AWS from "aws-sdk";
import { config as dotenvConfig } from "dotenv";

// Ensure dotenv is loaded here (important!)
dotenvConfig();

const s3 = new AWS.S3({
  endpoint: process.env.CF_ENDPOINT,
  accessKeyId: process.env.CF_ACCESS_KEY_ID,
  secretAccessKey: process.env.CF_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

export const uploadFile = async (file: Express.Multer.File) => {
  const params = {
    Bucket: process.env.CF_BUCKET_NAME!,
    Key: `${Date.now()}-${Math.random()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  console.log("Uploading to Cloudflare with params:", params);

  try {
    const result = await s3.upload(params).promise();
    return result;
  } catch (err) {
    console.error("Cloudflare Upload Error:", err);
    throw new Error("Failed to upload file to Cloudflare");
  }
};
