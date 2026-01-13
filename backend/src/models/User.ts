import { Schema, Document, model } from "mongoose";

export interface IUser extends Document {
  // --- Common Mandatory Fields ---
  userType: "general" | "business" | "admin";
  username: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  isVerified: boolean;

  // --- Common Optional Fields ---
  bio?: string;
  profilePic?: string; // ✅ New
  bannerImg?: string;  // ✅ New
  location?: string;   // ✅ New
  interests?: string[];

  // --- General User Specific ---
  age?: number;
  gender?: "Male" | "Female" | "Other";

  // --- Business User Specific ---
  companyName?: string;
  country?: string;    // ✅ New
  address?: string;
  gstNumber?: string;  // ✅ Renamed from GST
  
  // Verification & Store
  idProofType?: string; // ✅ Generic (PAN, Aadhar, License)
  idProofUrl?: string;  // ✅ URL to the uploaded doc
  productType?: string; // ✅ New
  cashOnDeliveryAvailable?: boolean; // ✅ New
}

const userSchema = new Schema<IUser>(
  {
    userType: {
      type: String,
      enum: ["general", "business", "admin"],
      required: true,
    },
    // ✅ Logic: Business users start unverified
    isVerified: {
      type: Boolean,
      default: function (this: IUser) {
        return this.userType !== "business";
      },
    },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },

    // --- Profile Assets ---
    bio: { type: String, trim: true },
    profilePic: { type: String, default: "" },
    bannerImg: { type: String, default: "" },
    location: { type: String, trim: true },
    interests: [{ type: String, trim: true }],

    // --- General Specific ---
    age: Number,
    gender: { type: String, enum: ["Male", "Female", "Other"] },

    // --- Business Specific ---
    companyName: {
      type: String,
      trim: true,
      required: function (this: IUser) { return this.userType === "business"; },
    },
    country: { type: String, trim: true },
    address: { type: String, trim: true },
    gstNumber: { type: String, trim: true }, // Optional, not all businesses have GST immediately
    
    // Identity Proof
    idProofType: { type: String, trim: true },
    idProofUrl: { type: String, trim: true },
    
    // Store Settings
    productType: { type: String, trim: true },
    cashOnDeliveryAvailable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Updated Business Validation Hook
userSchema.pre("save", function (next) {
  if (this.userType === "business") {
    // Ensure they provided an ID Proof URL
    if (!this.idProofUrl || !this.idProofType) {
      return next(new Error("Business accounts require a valid ID proof upload."));
    }
  }
  next();
});

export default model<IUser>("User", userSchema);