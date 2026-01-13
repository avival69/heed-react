import mongoose, { Schema } from "mongoose";

const imageSchema = new Schema(
  {
    high: { type: String, required: true },
    low: { type: String, required: true },
  },
  { _id: false }
);

const imagePostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number },
    allowComments: { type: Boolean, default: true },
    images: { type: [imageSchema], required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("ImagePost", imagePostSchema);
