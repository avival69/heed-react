import mongoose, { Schema, Document, model } from "mongoose";

export interface IUser extends Document {
  //Common mandatory fields
  userType: "general" | "business";
  username: string;
  name: string;
  email: string;
  password: string;
  phone: string;

  // Common optional fields
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
      enum: ["general", "business"],
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
      trim: true,//removes leading and trailing spaces
      index: true,//creates an index for faster search
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    // Common optional fields
    age: Number,
    bio: { type: String, trim: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    interests: [{ type: String, trim: true }],
    // Business fields
    companyName: {
      type: String,
      trim: true,
      required: function (this: IUser) {
        return this.userType === "business";
      },//required if userType is business
    },
    address: { type: String, trim: true },
    PAN: { type: String, trim: true },
    Aadhar: { type: String, trim: true },
    GST: { type: String, trim: true },
  },
  { timestamps: true }
);

// Business validation: at least one of PAN/Aadhar/GST for business users
userSchema.pre("save", function (next) { //this is a pre-save hook, runs before 
// saving a document to MongoDB
  if (
    this.userType === "business" &&
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
  { email: 1 },//index created in ascending order, descending order also same for unique
  { unique: true, collation: { locale: "en", strength: 2 } }
);
userSchema.index(
  { username: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }//strength 2 for case insensitivity
);

export default model<IUser>("User", userSchema);
