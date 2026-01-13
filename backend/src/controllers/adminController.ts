import { Request, Response } from "express";
import User from "../models/User.js";

// GET ALL PENDING BUSINESS USERS
export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const pendingUsers = await User.find({ 
      userType: "business", 
      isVerified: false 
    }).select("-password"); // Don't send passwords
    
    res.status(200).json(pendingUsers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// APPROVE USER
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { isVerified: true });
    res.status(200).json({ message: "User Approved ✅" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// REJECT USER (DELETE)
export const rejectUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User Rejected ❌" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};