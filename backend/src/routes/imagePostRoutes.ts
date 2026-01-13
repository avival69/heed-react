import { Router } from "express";
import { createImagePost } from "../controllers/imagePostController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js"; // your Multer config

const router = Router();

router.post(
  "/create",
  requireAuth,
  upload.array("images", 4), // 4 = max number of images
  createImagePost
);

export default router;
