import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getPresignedUrl } from "../cloudflare.js";

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
  
  // Optional / Specific fields
  bio?: string;
  profilePic?: string;
  bannerImg?: string;
  location?: string;
  age?: string; // Frontend might send as string
  gender?: "Male" | "Female" | "Other";
  interests?: string[];
  
  // Business fields
  companyName?: string;
  address?: string;
  country?: string;
  gstNumber?: string; // Updated from GST
  idType?: string;    // Frontend sends 'idType' -> User model 'idProofType'
  idDoc?: string;     // Frontend sends 'idDoc' -> User model 'idProofUrl'
  productType?: string;
  cashOnDelivery?: boolean; // Frontend sends 'cashOnDelivery' -> User model 'cashOnDeliveryAvailable'
}

interface LoginRequestBody {
  emailOrUsername: string;
  password: string;
}

/* =======================
   GENERATE UPLOAD URL
======================= */
export const generateUploadUrl = async (req: Request, res: Response) => {
  try {
    const { folder, fileType } = req.query;
    
    if (!folder || !fileType) {
      return res.status(400).json({ message: "Folder and fileType are required" });
    }

    const urls = await getPresignedUrl(folder as string, fileType as string);
    res.json(urls);
  } catch (error: any) {
    console.error("Generate URL Error:", error);
    res.status(500).json({ message: "Server error generating upload URL" });
  }
};

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

    console.log("SIGNUP BODY:", req.body); 

    const {
      userType,
      username,
      email,
      password,
      name,
      phone,
      bio,
      profilePic,
      bannerImg,
      location,
      age,
      gender,
      interests,
      companyName,
      address,
      country,
      gstNumber,
      idType,
      idDoc,
      productType,
      cashOnDelivery,
    } = req.body;

    // 1. Basic Validation
    if (!userType || !username || !email || !password || !name || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2. Check Duplicates
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

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    const newUser = new User({
      userType,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      name,
      phone,
      bio,
      profilePic,
      bannerImg,
      location,
      interests,
      
      // General specific
      age: age ? Number(age) : undefined,
      gender: (userType === "general" && gender) ? gender : undefined,

      // Business specific
      companyName: userType === "business" ? companyName : undefined,
      address: userType === "business" ? address : undefined,
      country: userType === "business" ? country : undefined,
      gstNumber: userType === "business" ? gstNumber : undefined,
      
      // Identity & Store
      idProofType: userType === "business" ? idType : undefined,
      idProofUrl: userType === "business" ? idDoc : undefined,
      productType: userType === "business" ? productType : undefined,
      cashOnDeliveryAvailable: userType === "business" ? cashOnDelivery : false,
    });

    await newUser.save();

    // 5. Generate Token
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
      // ✅ RETURN FULL USER OBJECT
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType,
        name: newUser.name,
        phone: newUser.phone,
        isVerified: newUser.isVerified,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
        bannerImg: newUser.bannerImg,
        location: newUser.location,
        interests: newUser.interests,
        companyName: newUser.companyName,
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
      // ✅ RETURN FULL USER OBJECT
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        name: user.name,
        phone: user.phone,
        isVerified: user.isVerified,
        bio: user.bio,
        profilePic: user.profilePic,
        bannerImg: user.bannerImg,
        location: user.location,
        interests: user.interests,
        companyName: user.companyName,
      },
    });
  } catch (error: any) {
    console.error("LOGIN BACKEND ERROR:", error);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};