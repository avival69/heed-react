import express from "express";
import { 
  signup, 
  login, 
  generateUploadUrl, 
  uploadImage // ✅ Import the new controller
} from "../controllers/authController.js";
import { upload } from "../middleware/upload.js"; // ✅ Import multer middleware

const router = express.Router();

router.get("/ping", (req, res) => {
  res.status(200).json({
    message: "Backend is reachable 🎯",
    time: new Date().toISOString(),
  });
});

// ✅ New Route for Frontend Image Upload
router.post("/upload-image", upload.single("file"), uploadImage);

// Keep the old one for reference if needed, but we aren't using it for profile anymore
router.get("/upload-url", generateUploadUrl);

router.post("/signup", signup);
router.post("/login", login);

export default router;