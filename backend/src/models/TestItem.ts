import mongoose from "mongoose";

const testItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const TestItem = mongoose.model("TestItem", testItemSchema);

export default TestItem;
