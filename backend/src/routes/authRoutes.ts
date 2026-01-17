import express from "express";
import { signup, login, generateUploadUrl } from "../controllers/authController.js";

const router = express.Router();

router.get("/ping", (req, res) => {
  res.status(200).json({
    message: "Backend is reachable 🎯",
    time: new Date().toISOString(),
  });
});

// ✅ New Route for Frontend Image Upload
router.get("/upload-url", generateUploadUrl);

router.post("/signup", signup);
router.post("/login", login);

export default router;