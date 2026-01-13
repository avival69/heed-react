import express from "express";
import { getPendingApprovals, approveUser, rejectUser } from "../controllers/adminController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// You might want to add a middleware to check if req.user.userType === 'admin'
router.get("/approvals", requireAuth, getPendingApprovals);
router.put("/approve/:id", requireAuth, approveUser);
router.delete("/reject/:id", requireAuth, rejectUser);

export default router;