const express = require("express");
const Project = require("../models/ProjectModel");
const Note = require("../models/NoteModel");
const Collaborator = require("../models/CollaboratorModel");
const Draft = require("../models/DraftModel");
const Image = require("../models/ImageModel");
const { Authority, Permission } = require("../models/AuthorityModel");
const mongoose = require('mongoose');

const {
  authenticate,
  checkPermission,
} = require("../middleware/AuthMiddleware");
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new project
router.post("/", async (req, res) => {
  try {
    const { name, description, collaborators } = req.body;

    // Create the project
    const project = new Project({
      name,
      description,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    await project.save();

    // Add collaborators with provided authority IDs
    if (collaborators && collaborators.length > 0) {
      const collaboratorDocs = collaborators.map((c) => {
        // Ensure authorities is an array and assign directly
        const authorities = Array.isArray(c.authority)
          ? c.authority
          : [c.authority];

        // Create a new Collaborator document without querying Authority
        return new Collaborator({
          userId: c.userId,
          authorities: authorities,
          createdBy: req.user._id,
          updatedBy: req.user._id,
        });
      });

      // Save all collaborators at once
      const savedCollaborators = await Collaborator.insertMany(
        collaboratorDocs
      );

      // Map collaborator document IDs to the project
      project.collaborators = savedCollaborators.map(
        (collaborator) => collaborator._id
      );
      await project.save();
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all projects (that the user has access to), along with associated notes
router.get("/", async (req, res) => {
  try {
    // Find all collaborator IDs for the current user
    const collaboratorIds = await Collaborator.find({
      userId: req.user._id,
    }).distinct("_id");

    // Find all projects where the user is either the creator or a collaborator
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id }, // Projects created by the user
        { collaborators: { $in: collaboratorIds } }, // Projects where the user is a collaborator
      ],
    });

    // Loop through each project to fetch the notes associated with each project
    const projectsWithNotes = await Promise.all(
      projects.map(async (project) => {
        // Fetch notes related to the current project
        const notes = await Note.find({ project: project._id });

        // Return the project along with its associated notes
        return {
          ...project.toObject(),
          notes,
        };
      })
    );

    res.json(projectsWithNotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific project along with its notes checkPermission("view_project"),
// Get a specific project along with its notes
router.get("/:id", async (req, res) => {
  try {
    // Fetch the project with collaborators
    const project = await Project.findById(req.params.id)
      .populate({
        path: "collaborators",
        populate: {
          path: "userId",
          select: "firstName lastName username email profile",
        },
      })
      .populate({
        path: "createdBy updatedBy",
        select: "firstName lastName username email profile",
      });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Fetch all notes associated with the project
    const notes = await Note.find({ project: req.params.id }).populate(
      "createdBy modifiedBy",
      "firstName lastName username email profile"
    );

    // Fetch all drafts associated with the project
    const drafts = await Draft.find({ project: req.params.id }).populate(
      "createdBy modifiedBy",
      "firstName lastName username email profile"
    );

    // Fetch all images for each draft
    const draftsWithImages = await Promise.all(
      drafts.map(async (draft) => {
        const images = await Image.find({ draft: draft._id }).populate(
          "createdBy",
          "firstName lastName username email profile"
        );
        return {
          ...safeToObject(draft),
          images: images.map(safeToObject),
        };
      })
    );

    // Fetch and populate authorities and permissions for collaborators
    const populatedCollaborators = await Promise.all(
      (project.collaborators || []).map(async (collaborator) => {
        if (!collaborator) return null;
        const populatedAuthorities = await Authority.find({
          _id: { $in: collaborator.authorities || [] },
        }).populate("permissions");
        return {
          ...safeToObject(collaborator),
          userId: safeToObject(collaborator.userId),
          authorities: populatedAuthorities.map(safeToObject),
        };
      })
    ).then((collaborators) => collaborators.filter(Boolean));

    // Helper function to safely convert to object
    function safeToObject(doc) {
      if (doc === null || doc === undefined) {
        return null;
      }
      if (doc instanceof mongoose.Document) {
        return doc.toObject();
      }
      if (typeof doc === "object" && !Array.isArray(doc)) {
        return { ...doc };
      }
      return doc;
    }

    // Construct the final response
    const response = {
      project: {
        ...safeToObject(project),
        collaborators: populatedCollaborators,
        createdBy: safeToObject(project.createdBy),
        updatedBy: safeToObject(project.updatedBy),
      },
      notes: notes.map((note) => ({
        ...safeToObject(note),
        createdBy: safeToObject(note.createdBy),
        modifiedBy: safeToObject(note.modifiedBy),
      })),
      drafts: draftsWithImages.map((draft) => ({
        ...draft,
        createdBy: safeToObject(draft.createdBy),
        modifiedBy: safeToObject(draft.modifiedBy),
        images: (draft.images || []).map((image) => ({
          ...image,
          createdBy: safeToObject(image.createdBy),
        })),
      })),
    };

    // Send the project along with all associated data
    res.json(response);
  } catch (error) {
    console.error("Error in project route:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching project data" });
  }
});

// Update a project
router.put("/:id", checkPermission("edit_project"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, updatedBy: req.user._id, updatedAt: Date.now() },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a project
router.delete("/:id", checkPermission("delete_project"), async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // Delete associated collaborators
    await Collaborator.deleteMany({ _id: { $in: project.collaborators } });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a collaborator to a project
router.post(
  "/:id/collaborators",
  checkPermission("manage_collaborators"),
  async (req, res) => {
    try {
      const { userId, authorities } = req.body;
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      const collaborator = new Collaborator({
        userId,
        authorities,
        createdBy: req.user._id,
        updatedBy: req.user._id,
      });
      await collaborator.save();
      project.collaborators.push(collaborator._id);
      await project.save();
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a collaborator's authorities
router.put(
  "/:id/collaborators/:collaboratorId",
  checkPermission("assign_authorities"),
  async (req, res) => {
    try {
      const { authorities } = req.body;
      const collaborator = await Collaborator.findByIdAndUpdate(
        req.params.collaboratorId,
        { authorities, updatedBy: req.user._id, updatedAt: Date.now() },
        { new: true }
      );
      if (!collaborator) {
        return res.status(404).json({ message: "Collaborator not found" });
      }
      res.json(collaborator);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
