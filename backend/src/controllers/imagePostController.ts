import { Response } from "express";
import ImagePost from "../models/ImagePost.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
//NEED AUTHMIDDLEWARE TO GET REQ.USER NOT NEEDED IN CONTROLLERS/AUTHCONTROLLER.TS
/* =========================
   CREATE IMAGE POST
========================= */
export const createImagePost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, images, description, allowComments, price } = req.body;

    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (!title || !images || !description) return res.status(400).json({ message: "Missing required fields" });
    if (!Array.isArray(images) || images.length === 0 || images.length > 4)
      return res.status(400).json({ message: "You can upload 1 to 4 images only" });

    if (price && user.userType !== "business") return res.status(403).json({ message: "Only business accounts can add price" });

    const newPost = new ImagePost({
      user: user._id,
      title,
      images,
      description,
      allowComments: allowComments ?? true,
      price: user.userType === "business" ? price : undefined,
    });

    const savedPost = await newPost.save();
    res.status(201).json({ message: "Image post created successfully", post: savedPost });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- GET ALL POSTS ----------------
export const getAllImagePosts = async (req: AuthRequest, res: Response) => {
  try {
    const posts = await ImagePost.find()
      .populate("user", "username userType name")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------- LIKE POST ----------------
export const toggleLikePost = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const post = await ImagePost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // If user has already liked → unlike
    if (post.likedBy.includes(user._id)) {
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(u => u.toString() !== user._id.toString());
      await post.save();
      return res.status(200).json({ message: "Post unliked", likes: post.likes });
    }

    // If user hasn't liked → like
    post.likes += 1;
    post.likedBy.push(user._id);
    await post.save();
    return res.status(200).json({ message: "Post liked", likes: post.likes });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
