import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    owned: { type: Boolean, default: false },
    entity: {
      type: String,
      enum: ["NOTE", "PROJECT", "COLLABORATOR"],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
