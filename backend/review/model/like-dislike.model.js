import mongoose from "mongoose";

const likeDislikeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
    entity: {
      type: String,
      enum: ["NOTE", "PROJECT", "COLLABORATOR"],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    userLiked: { type: Boolean, default: false },
    userDisliked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const LikeDislike = mongoose.model("LikeDislike", likeDislikeSchema);
