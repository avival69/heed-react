import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* =======================
   REQUEST BODY TYPES
======================= */

interface SignupRequestBody {
  userType: "general" | "business";
  username: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  companyName?: string;
  address?: string;
  PAN?: string;
  Aadhar?: string;
  GST?: string;
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
    const JWT_SECRET = process.env.JWT_SECRET!;
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in .env");

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

    if (!userType || !username || !email || !password || !name || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      if (existingUser.username === normalizedUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userType,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      name,
      phone,
      companyName: userType === "business" ? companyName : undefined,
      address: userType === "business" ? address : undefined,
      PAN: userType === "business" ? PAN : undefined,
      Aadhar: userType === "business" ? Aadhar : undefined,
      GST: userType === "business" ? GST : undefined,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        _id: newUser._id,
        username: newUser.username,
        userType: newUser.userType,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

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
    console.error("SIGNUP BACKEND ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

/* =======================
          LOGIN
======================= */
export const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
) => {
  console.log("LOGIN HIT", req.body);
  try {
    const JWT_SECRET = process.env.JWT_SECRET!;
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in .env");

    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res
        .status(400)
        .json({ message: "Email/Username and password required" });
    }

    const normalized = emailOrUsername.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ email: normalized }, { username: normalized }],
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        userType: user.userType,
      },
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
      },
    });
  } catch (error: any) {
    console.error("LOGIN BACKEND ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};
