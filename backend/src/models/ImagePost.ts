import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User.js";

export interface IImagePost extends Document {
  user: IUser["_id"]; // Reference to User
  title: string;
  images: string[];
  price?: number;
  description: string;
  allowComments: boolean;
  likes: number;
  likedBy: IUser["_id"][]; // users who liked
  createdAt: Date;
}

const ImagePostSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  images: {
    type: [String],
    required: true,
    validate: [(val: string[]) => val.length <= 4, "Maximum 4 images allowed"],
  },
  price: { type: Number, required: false },
  description: { type: String, required: true },
  allowComments: { type: Boolean, default: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }], // <-- track users who liked
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IImagePost>("ImagePost", ImagePostSchema);
