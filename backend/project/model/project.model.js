import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    collaborators: [
      {
        collaborator: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Collaborator",
          index: true,
        },
        authority: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Authority",
          index: true,
        },
        _id: false,
      },
    ],
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

// Compound index for efficient querying
projectSchema.index({
  createdBy: 1,
  status: 1,
  createdAt: -1,
});

// Text search index
projectSchema.index({ title: "text", description: "text" });

export const Project = mongoose.model("Project", projectSchema);
