// src/models/Image.ts
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploader: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model("Image", imageSchema);

export default Image;
