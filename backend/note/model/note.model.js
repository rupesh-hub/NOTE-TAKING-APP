import mongoose from "mongoose";

const noteSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    content: String,
    images: {
      type: [String],
      required: false,
    },
    urls: {
      type: [String],
      validate: {
        validator: (v) => v.every((url) => /^https?:\/\/.+/i.test(url)),
        message: "All URLs must be valid",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Add indexes for performance
noteSchema.index({ createdBy: 1 });
noteSchema.index({ project: 1 });

export const Note = mongoose.model("Note", noteSchema);
