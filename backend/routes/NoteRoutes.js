const express = require("express");
const Note = require("../models/NoteModel");
const Collaborator = require("../models/CollaboratorModel");
const Project = require("../models/ProjectModel");

const {
  authenticate,
  checkPermission,
} = require("../middleware/AuthMiddleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new note
router.post("/", checkPermission("create_note"), async (req, res) => {
  try {
    const { title, content, images, urls, projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const note = new Note({
      title,
      content,
      images,
      urls,
      project: projectId,
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all notes for a project
router.get("/project/:id", checkPermission("view_note"), async (req, res) => {
  try {
    const notes = await Note.find({ project: req.params.id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all notes for user - owner or collaborator
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user._id holds the logged-in user’s ID

    // Step 1: Find all projects where the user is the owner or a collaborator
    const accessibleProjects = await Project.find({
      $or: [
        { createdBy: userId },
        {
          collaborators: {
            $in: await Collaborator.find({ userId: userId }).distinct("_id"),
          },
        },
      ],
    }).select("_id"); // Only selecting project IDs

    // Extract project IDs from accessibleProjects
    const projectIds = accessibleProjects.map((project) => project._id);

    // Step 2: Find all notes associated with those project IDs
    const notes = await Note.find({
      project: { $in: projectIds },
    });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get a specific note
router.get("/:id", checkPermission("view_note"), async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a note
router.put("/:id", checkPermission("edit_note"), async (req, res) => {
  try {
    const { title, content, images, urls } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        images,
        urls,
        modifiedBy: req.user._id,
        modifiedAt: Date.now(),
      },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a note
router.delete("/:id", checkPermission("delete_note"), async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
