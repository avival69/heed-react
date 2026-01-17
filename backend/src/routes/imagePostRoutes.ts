import { Router } from "express";
import {
  createImagePost,
  getAllImagePosts,   getMyImagePosts,   // ✅ ADD
  getSinglePost,     // ✅ ADD
  toggleLikePost,    // ✅ ADD
} from "../controllers/imagePostController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";

const router = Router();

/* ---------- CREATE POST ---------- */
router.post(
  "/create",
  requireAuth,
  upload.array("images", 4),
  createImagePost
);

/* ---------- GET ALL POSTS (HomeScreen) ---------- */
router.get("/", getAllImagePosts);
router.get("/posts/me", requireAuth, getMyImagePosts);
/* ---------- GET SINGLE POST (ItemScreen) ---------- */
router.get("/:id", getSinglePost);

/* ---------- TOGGLE LIKE ---------- */
router.post("/:postId/like", requireAuth, toggleLikePost);


export default router;
