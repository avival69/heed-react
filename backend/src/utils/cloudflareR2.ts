import AWS from "aws-sdk";

const s3 = new AWS.S3({
  endpoint: process.env.CF_ENDPOINT,
  accessKeyId: process.env.CF_ACCESS_KEY_ID,
  secretAccessKey: process.env.CF_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

export const uploadFile = async (file: Express.Multer.File) => {
  const params = {
    Bucket: process.env.CF_BUCKET_NAME!,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  return s3.upload(params).promise();
};
