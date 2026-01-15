import mongoose, { Schema } from "mongoose";


//this below is a subdocument which represents an image with high and low resolution URLs
const imageSchema = new Schema(
  {
    high: { type: String, required: true },
    low: { type: String, required: true },
  },
  { _id: false }//By default, MongoDB creates an _id for every sub-document.
                //This option disables it.
);

//this is the main schema for image posts
const imagePostSchema = new Schema(
  {
    //reference to the user who created the post
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number },
    allowComments: { type: Boolean, default: true },
    images: { type: [imageSchema], required: true },
    likes: { type: Number, default: 0 },
    //array of user IDs who liked the post
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
  //automatically adds createdAt and updatedAt fields
);

export default mongoose.model<IImagePost>("ImagePost", ImagePostSchema);
