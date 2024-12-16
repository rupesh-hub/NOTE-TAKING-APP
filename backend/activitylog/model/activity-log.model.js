import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    operation: {
      type: String,
      required: true,
      enum: [
        "NOTE_CREATED",
        "NOTE_UPDATED",
        "NOTE_DELETED",
        "PROJECT_CREATED",
        "PROJECT_UPDATED",
        "PROJECT_DELETED",
        "COLLABORATOR_ADDED",
        "COLLABORATOR_REMOVED",
        "USER_CREATED",
        "USER_UPDATED",
        "USER_DELETED",
        "USER_LOGIN",
        "USER_LOGOUT",
      ],
    },
    entityType: {
      type: String,
      required: true,
      enum: ["NOTE", "PROJECT", "COLLABORATOR", "USER"],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    projectid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: function () {
        return this.entityType === "PROJECT";
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      ipAddress: { type: String, default: "N/A" },
      userAgent: { type: String, default: "Unknown" },
      location: {
        country: { type: String, default: "Unknown" },
        city: { type: String, default: "Unknown" },
      },
    },
    message: {
      type: String,
      required: false,
      default: "",
    },
    projectId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILURE"],
      default: "SUCCESS",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ActivityLogSchema.index({ entityType: 1, entityId: 1 });
ActivityLogSchema.index({ userId: 1 });

// Middleware
ActivityLogSchema.pre("save", async function (next) {
  if (this.entityType === "PROJECT" && !this.projectid) {
    return next(new Error("Project ID is required for PROJECT entity type."));
  }
  next();
});

export const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);
