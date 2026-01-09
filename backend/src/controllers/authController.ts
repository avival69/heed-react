import { Request, Response } from "express";
import bcrypt from "bcryptjs"; // For hashing passwords
import jwt from "jsonwebtoken"; // For generating JWT
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// --------------------- SIGNUP ---------------------
export const signup = async (req: Request, res: Response) => {
  try {
    const {
      userType,
      username,
      email,
      password,
      name,
      phone,
      companyName,
      address,
      PAN,
      Aadhar,
      GST,
    } = req.body;

    // Check required fields for all users
    if (!userType || !username || !email || !password || !name || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Normalize email and username
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    }).lean();

    if (existingUser) {
      if (existingUser.email === normalizedEmail)
        return res.status(400).json({ message: "Email already exists" });
      if (existingUser.username === normalizedUsername)
        return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = new User({
      userType,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      name,
      phone,
      // Only include business fields if userType is business
      companyName: userType === "business" ? companyName : undefined,
      address: userType === "business" ? address : undefined,
      PAN: userType === "business" ? PAN : undefined,
      Aadhar: userType === "business" ? Aadhar : undefined,
      GST: userType === "business" ? GST : undefined,
    });

    // Save to database
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

    // Send response
    return res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType,
        name: newUser.name,
        phone: newUser.phone,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error.message || error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --------------------- LOGIN ---------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "Email/Username and password required" });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase().trim() },
        { username: emailOrUsername.toLowerCase().trim() },
      ],
    }).lean();

    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

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
      },
    });
  } catch (error: any) {
    console.error("Login error:", error.message || error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
