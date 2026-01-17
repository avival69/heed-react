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
    price: { type: Number , min: 0},
    allowComments: { type: Boolean, default: true },
        allowLikes: {
      type: Boolean,
      default: true,
    },
    images: { type: [imageSchema], required: true },

    // ✅ SINGLE SOURCE OF TRUTH
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("ImagePost", imagePostSchema);
