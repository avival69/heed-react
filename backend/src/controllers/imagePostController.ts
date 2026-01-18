import {Request,  Response } from "express";
import mongoose from "mongoose";
import ImagePost from "../models/ImagePost.js";

import { processImage } from "../utils/ProcessImage.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

/* =========================
   CREATE IMAGE POST
========================= */
export const createImagePost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { title, description } = req.body
    const priceRaw = req.body.price;
    const allowComments =
  req.body.allowComments === undefined
    ? true
    : req.body.allowComments === "true";

const allowLikes =
  req.body.allowLikes === undefined
    ? true
    : req.body.allowLikes === "true";


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

const parsedPrice =
  req.user.userType === "business" &&
  typeof priceRaw === "string" &&
  priceRaw.trim() !== "" &&
  !isNaN(Number(priceRaw))
    ? Number(priceRaw)
    : undefined;

const post = await ImagePost.create({
  user: req.user._id,
  title,
  description,
  allowComments,
  allowLikes,
  price: parsedPrice, // ✅ NEVER NaN
  images,
});

const populatedPost = await ImagePost.findById(post._id)
  .populate("user", "username userType");

return res.status(201).json({
  ...populatedPost!.toObject(),
  likes: 0,
});

  } catch (err: any) {
    console.error("CREATE POST ERROR:", err);
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    return res.status(500).json({ message: "Failed to create post" });
  }
};
/* =========================
   GET ALL POSTS (PAGINATED)
========================= */
export const getAllImagePosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await ImagePost.find()
      .populate("user", "username userType")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    /* ✅ compute likes */
    const formatted = posts.map(post => ({
      ...post.toObject(),
      likes: post.likedBy.length,
    }));

    // Return array directly to keep frontend parsing simple, 
    // or return object { data: [], hasMore: boolean }
    // For now, let's just return the array. Frontend stops when array < limit.
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

/* =========================
   GET SINGLE IMAGE POST
========================= */
export const getSinglePost = async (req: Request, res: Response) => {
  try {
    /* ✅ safe param typing */
    const { id } = req.params as { id: string };

    const post = await ImagePost.findById(id)
      .populate("user", "username userType");

    if (!post)
      return res.status(404).json({ message: "Not found" });

    res.json({
      ...post.toObject(),
      likes: post.likedBy.length, // ✅ computed
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch post" });
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

      if (post.allowLikes === false) {
    return res.status(403).json({ message: "Likes are disabled for this post" });
  }

    const userId = req.user._id.toString();

    const index = post.likedBy.findIndex(
      (id) => id.toString() === userId
    );

    if (index !== -1) {
      // UNLIKE
      post.likedBy.splice(index, 1);
    } else {
      // LIKE
      post.likedBy.push(new mongoose.Types.ObjectId(userId));
    }

await post.save();

const populated = await ImagePost.findById(post._id)
  .populate("user", "username userType");

if (!populated) {
  return res.status(404).json({ message: "Post not found after update" });
}

res.json({
  ...populated.toObject(),
  likes: populated.likedBy.length,
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

// GET MY POSTS//
export const getMyImagePosts = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const posts = await ImagePost.find({ user: req.user._id })
      .populate("user", "username userType")
      .sort({ createdAt: -1 });

    const formatted = posts.map(post => ({
      ...post.toObject(),
      likes: post.likedBy.length,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch my posts" });
  }
};