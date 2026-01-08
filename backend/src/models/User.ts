import mongoose, { Schema, Document, model } from "mongoose";

export interface IUser extends Document {
  userType: "general" | "standard";
  username: string;
  name: string;
  email: string;
  password: string;
  phone: string;

  // Common fields
  age?: number;
  bio?: string;
  gender?: "male" | "female" | "other";
  interests?: string[];

  // Business-only fields
  companyName?: string;
  address?: string;
  PAN?: string;
  Aadhar?: string;
  GST?: string;
}

const userSchema = new Schema<IUser>(
  {
    userType: {
      type: String,
      enum: ["general", "standard"],
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // Common fields
    age: Number,
    bio: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    interests: [{ type: String, trim: true }],
    // Business fields
    companyName: {
      type: String,
      trim: true,
      required: function (this: IUser) {
        return this.userType === "standard";
      },
    },
    address: { type: String, trim: true },
    PAN: { type: String, trim: true },
    Aadhar: { type: String, trim: true },
    GST: { type: String, trim: true },
  },
  { timestamps: true }
);

// Business validation: at least one of PAN/Aadhar/GST for standard users
userSchema.pre("save", function (next) {
  if (
    this.userType === "standard" &&
    !this.PAN &&
    !this.Aadhar &&
    !this.GST
  ) {
    return next(
      new Error(
        "At least one of PAN, Aadhar, or GST is required for business users"
      )
    );
  }
  next();
});

// Case-insensitive unique indexes
userSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
userSchema.index(
  { username: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export default model<IUser>("User", userSchema);
