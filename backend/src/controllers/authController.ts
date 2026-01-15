import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

/* =======================
   REQUEST BODY TYPES
======================= */

interface SignupRequestBody {
  userType: "general" | "business" | "admin";
  username: string;
  email: string;
  password: string;
  name: string;
  phone: string;

  // Common Optional
  bio?: string;
  profilePic?: string;
  bannerImg?: string;
  location?: string;
  interests?: string[];

  // General fields
  age?: number;
  gender?: "Male" | "Female" | "Other";

  // Business fields
  companyName?: string;
  country?: string;
  address?: string;
  gstNumber?: string;
  idType?: string;      // Maps to idProofType
  idDoc?: string;       // Maps to idProofUrl
  productType?: string;
  cashOnDelivery?: boolean;
}

interface LoginRequestBody {
  emailOrUsername: string;
  password: string;
}

/* =======================
        SIGNUP
======================= */

export const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
) => {
  try {
    const {
      userType,
      username,
      email,
      password,
      name,
      phone,
      // Optional & Profile
      bio,
      profilePic,
      bannerImg,
      location,
      interests,
      // General
      age,
      gender,
      // Business
      companyName,
      country,
      address,
      gstNumber,
      idType,      // Incoming from Frontend
      idDoc,       // Incoming from Frontend
      productType,
      cashOnDelivery,
    } = req.body;

    // Validate required fields
    if (!userType || !username || !email || !password || !name || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Normalize email and username
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) return res.status(400).json({ message: "Email already exists" });
      if (existingUser.username === normalizedUsername) return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      userType,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      name,
      phone,
      
      // Common Profile Data
      bio,
      profilePic, 
      bannerImg, 
      location,
      interests,

      // General Logic
      age: userType === "general" && age ? Number(age) : undefined,
      gender: userType === "general" ? gender : undefined,

      // Business Logic
      companyName: userType === "business" ? companyName : undefined,
      country: userType === "business" ? country : undefined,
      address: userType === "business" ? address : undefined,
      gstNumber: userType === "business" ? gstNumber : undefined,
      
      // Map Frontend ID fields to Schema fields
      idProofType: userType === "business" ? idType : undefined,
      idProofUrl: userType === "business" ? idDoc : undefined,
      
      productType: userType === "business" ? productType : undefined,
      cashOnDeliveryAvailable: userType === "business" ? cashOnDelivery : false,
    });

    // Note: isVerified is set automatically by the Model (Business=false, General=true)
    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: userType === 'business' ? "Application submitted for review" : "User created successfully",
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType,
        name: newUser.name,
        phone: newUser.phone,
        isVerified: newUser.isVerified, // Critical for frontend redirection
        profilePic: newUser.profilePic,
      },
    });

  } catch (error: any) {
    console.error("SIGNUP BACKEND ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};

/* =======================
         LOGIN
======================= */

export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "Email/Username and password required" });
    }

    const normalized = emailOrUsername.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ email: normalized }, { username: normalized }],
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified,
        profilePic: user.profilePic,
      },
    });
  } catch (error: any) {
    console.error("LOGIN BACKEND ERROR:", error);
    return res.status(500).json({
      message: error.message || "Server error",
    });
  }
};