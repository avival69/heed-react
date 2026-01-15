import { Response } from "express";
import mongoose from "mongoose";
import ImagePost from "../models/ImagePost.js";
import { processImage } from "../utils/processImage.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

/* =========================
   CREATE IMAGE POST
========================= */
export const createImagePost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { title, description, allowComments } = req.body;
    const priceRaw = req.body.price;

    if (!title || !description)
      return res.status(400).json({ message: "Title and description required" });

    if (req.user.userType === "general" && priceRaw !== undefined && priceRaw !== "")
      return res.status(400).json({ message: "Price is only allowed for business users" });

    const files = Array.isArray(req.files)
      ? req.files
      : req.files
      ? Object.values(req.files).flat()
      : [];

    if (files.length === 0) return res.status(400).json({ message: "Images are required" });

    const images: { high: string; low: string }[] = [];

    for (const file of files) {
      const name = `${Date.now()}-${Math.random()}`;
      const processed = await processImage(file.buffer, name);

      images.push({
        high: processed.high,
        low: processed.low,
      });
    }
console.log("REQ.USER:", req.user);
console.log("REQ.BODY:", req.body);
console.log("REQ.FILES:", req.files);

const post = await ImagePost.create({
  user: new mongoose.Types.ObjectId(req.user._id),
  title,
  description,
  allowComments: allowComments !== undefined ? Boolean(allowComments) : true,
  price: req.user.userType === "business" && priceRaw !== "" ? Number(priceRaw) : undefined,
  images,
});

console.log("POST CREATED:", post);

    return res.status(201).json(post);
  } catch (err: any) {
    console.error("CREATE POST ERROR:", err);
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    return res.status(500).json({ message: "Failed to create post" });
  }
};
/* =========================
   GET ALL POSTS
========================= */
export const getAllImagePosts = async (_: AuthRequest, res: Response) => {
  try {
    const posts = await ImagePost.find()
      .populate("user", "username userType")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

/* =========================
   TOGGLE LIKE
========================= */
export const toggleLikePost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const post = await ImagePost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const index = post.likedBy.findIndex((id) => id.toString() === userId);

    if (index !== -1) {
      post.likedBy.splice(index, 1);
      post.likes -= 1;
    } else {
      post.likedBy.push(new mongoose.Types.ObjectId(userId));
      post.likes += 1;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};
