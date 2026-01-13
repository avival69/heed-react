import mongoose from "mongoose";//mongoose library for MongoDB interaction
//dotenv only needed in index.ts for config loading (only once needed)

export const connectDB = async () => { //Async function to connect to MongoDB
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};
