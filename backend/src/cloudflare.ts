import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();

const s3 = new AWS.S3({
  endpoint: process.env.CF_ENDPOINT, // Cloudflare R2 endpoint
  accessKeyId: process.env.CF_ACCESS_KEY_ID,
  secretAccessKey: process.env.CF_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

export const uploadToR2 = async (key: string, buffer: Buffer, contentType: string) => {
  const params = {
    Bucket: process.env.CF_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "public-read", // optional, if you want public access
  };

  await s3.putObject(params).promise();

  return `${process.env.CF_ENDPOINT}/${key}`; // public URL
};
