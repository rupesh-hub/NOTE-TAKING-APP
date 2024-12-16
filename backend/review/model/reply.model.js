import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
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
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Reply = mongoose.model("Reply", replySchema);
