import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";//node path module to handle file paths
import { connectDB } from "./config/db.js";//to connect to MongoDB
import authRoutes from "./routes/authRoutes.js";//import auth routes for user authentication
import imagePostRoutes from "./routes/imagePostRoutes.js";//import image post routes



const app = express();//create express app
connectDB();//connect to MongoDB

app.use(cors());//enable CORS
app.use(express.json());//middleware to parse JSON request bodies

// ✅ SERVE UPLOADED IMAGES
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imagePostRoutes);

const PORT: number = parseInt(process.env.PORT || "5000", 10);
//environemnt varibales are strings by default, so we parse to number
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});//0.0.0 to accept all incoming connections (not just localhost)
