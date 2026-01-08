import express from "express";
import { createImagePost, getAllImagePosts, toggleLikePost } from "../controllers/imagePostController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", requireAuth, createImagePost);
router.put("/like/:postId", requireAuth, toggleLikePost);
router.get("/", requireAuth, getAllImagePosts);


export default router;
