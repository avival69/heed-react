import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import imagePostRoutes from "./routes/imagePostRoutes.js";

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imagePostRoutes);


const PORT: number = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

