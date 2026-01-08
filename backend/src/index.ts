import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";

import { uploadToR2 } from "./cloudflare.js"; // Cloudflare helper
import Image from "./models/Image.js";       // Image model

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL!)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// -----------------------
// Multer setup (memory storage)
const upload = multer(); 

// -----------------------
// Upload image to Cloudflare R2 + save metadata in MongoDB
app.post("/images", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Upload file buffer to Cloudflare R2
    const url = await uploadToR2(
      req.file.originalname,
      req.file.buffer,
      req.file.mimetype
    );

    // Save metadata in MongoDB
    const image = new Image({ name: req.file.originalname, url });
    await image.save();

    res.status(201).json(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// -----------------------
// Get all images
app.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// -----------------------
// Root route
app.get("/", (req, res) => {
  res.send("Heed Backend is running and MongoDB + Cloudflare R2 tested!");
});

// -----------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
