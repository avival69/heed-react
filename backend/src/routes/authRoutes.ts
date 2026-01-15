import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();//create express router
router.get("/ping", (req, res) => {
  res.status(200).json({
    message: "Backend is reachable 🎯",
    time: new Date().toISOString(),
  });
});
router.post("/signup", signup);
router.post("/login", login);

export default router;
