import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import imagePostRoutes from "./routes/imagePostRoutes.js";
// 1. IMPORT ADMIN ROUTES
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imagePostRoutes);
// 2. REGISTER ADMIN ROUTES
app.use("/api/admin", adminRoutes);

const PORT: number = parseInt(process.env.PORT || "5000", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});