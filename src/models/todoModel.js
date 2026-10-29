import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    sessionUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "session",
      required: true,
    },
  },
  { timestamps: true },
);

const todoModel = mongoose.model("todo", todoSchema);

export default todoModel;
