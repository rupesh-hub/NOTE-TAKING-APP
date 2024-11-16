const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: {type: String, required: false},
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedAt: { type: Date, default: Date.now },
  collaborators: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Collaborator" },
  ],
});

module.exports = mongoose.model("Project", projectSchema);