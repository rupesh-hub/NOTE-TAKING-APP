import { Note } from "../model/note.model.js";
import {
  deleteFile,
  fullFilePath,
  noteImagePath,
} from "../../multer/file-management.js";
import { Project } from "../../project/model/project.model.js";
import { LoggingService } from "../../activitylog/service/logging.service.js";
import { Collaborator } from "../../collaborator/model/collaborator.model.js";
import { io } from "../../server.js";

export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { projectId } = req.query;
    const createdBy = req.user.userId;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Check collaborator permissions if project is specified
    if (projectId) {
      const hasPermission = await checkCollaboratorPermission(
        projectId,
        createdBy,
        ["editor"]
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: "You do not have permission to create notes in this project",
        });
      }
    }

    // Optional image handling
    const images = req.files
      ? req.files.map((file) => noteImagePath(file.filename))
      : [];

    const newNote = new Note({
      title,
      content: content || "",
      images,
      project: projectId || null,
      createdBy,
      modifiedBy: createdBy,
      status: "active",
      collaborators: projectId ? [createdBy] : [], // Initial collaborator
    });

    const savedNote = await newNote.save();

    // Log the activity
    await LoggingService.log({
      operation: "NOTE_CREATED",
      entityType: "NOTE",
      entityId: savedNote._id,
      userId: createdBy,
      details: {
        title: savedNote.title,
        projectId: projectId || null,
        images: images.length,
        message: `🎉 Note titled '${savedNote.title}' was successfully created.`,
      },
      metadata: {
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.get("User-Agent") || "",
      },
      status: "SUCCESS",
    });

    // Broadcast note creation via Socket.IO if it's a project note
    if (projectId) {
      io.to(projectId).emit("note-created", {
        note: savedNote,
        createdBy,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      message: "Note created successfully",
      data: savedNote,
    });
  } catch (error) {
    // Log the failure
    await LoggingService.log({
      operation: "NOTE_CREATED",
      entityType: "NOTE",
      entityId: null,
      userId: req.user.userId,
      details: {
        title: req.body.title,
        error: error.message,
      },
      status: "FAILURE",
    });

    console.error("Error creating note:", error);
    res.status(500).json({
      message: "Error creating note",
      error: error.message,
    });
  }
};

export const updateNote = async (req, res) => {
  const { title, content } = req.body;
  const { projectId } = req.query;
  const { noteId } = req.params;
  const modifiedBy = req.user.userId;

  console.log("Update note", title, content, req.files);

  try {
    // Fetch the note by ID
    const note = await Note.findOne({ _id: noteId });
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Initialize variables for the uploaded files (images)
    const uploadedFiles = req.files
      ? req.files.map((file) => noteImagePath(file.filename))
      : [];

    // If there are uploaded files (images) in the request, handle the image update
    if (uploadedFiles.length > 0) {
      // Simply append the new images to the existing ones, without deleting old ones
      note.images = [...note.images, ...uploadedFiles];
    }

    // Update the note fields, keeping existing ones if not provided
    note.title = title || note.title;
    note.content = content || note.content;
    note.project = projectId || note.project;
    note.modifiedBy = modifiedBy;

    // Save the updated note
    const updatedNote = await note.save();

    // Log the update activity
    await LoggingService.log({
      operation: "NOTE_UPDATED",
      entityType: "NOTE",
      entityId: noteId,
      userId: modifiedBy,
      details: {
        title: updatedNote.title,
        projectId: updatedNote.project,
        images: updatedNote.images,
        message: `🎉 Note titled '${updatedNote.title}' was successfully updated.`,
      },
      metadata: {
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.get("User-Agent") || "",
      },
      status: "SUCCESS",
    });

    // Emit update via Socket.IO
    io.to(note.project.toString()).emit("note-updated", {
      noteId,
      updates: updatedNote,
      userId: modifiedBy,
    });

    // Respond with success
    res
      .status(200)
      .json({ message: "Note updated successfully", data: updatedNote });
  } catch (error) {
    // Log the update failure
    await LoggingService.log({
      operation: "NOTE_UPDATED",
      entityType: "NOTE",
      entityId: noteId,
      userId: req.user.userId,
      details: {
        error: error.message,
      },
      status: "FAILURE",
    });

    console.error("Error updating note:", error);
    res
      .status(500)
      .json({ message: "Error updating note", error: error.message });
  }
};

export const getNoteDetails = async (req, res) => {
  try {
    const { noteId } = req.params;

    // Fetch note details with populated fields for createdBy and modifiedBy
    const note = await Note.findById(noteId)
      .populate({
        path: "createdBy",
        select: "firstName lastName email profile", // Populate user fields for creator
      })
      .populate({
        path: "modifiedBy",
        select: "firstName lastName email profile", // Populate user fields for modifier
      });

    if (!note) return res.status(404).json({ message: "Note not found" });

    // Ensure profile URLs for note creators and modifiers
    if (note.createdBy && note.createdBy.profile) {
      note.createdBy.profile = `/api/v1.0.0/uploads/profiles/${note.createdBy.profile}`;
    }

    if (note.modifiedBy && note.modifiedBy.profile) {
      note.modifiedBy.profile = `/api/v1.0.0/uploads/profiles/${note.modifiedBy.profile}`;
    }

    console.log(note);

    const project = await Project.findOne({ _id: note.project })
      .populate({
        path: "createdBy",
        select: "firstName lastName email profile", // Populate user fields for project creator
      })
      .populate({
        path: "updatedBy",
        select: "firstName lastName email profile", // Populate user fields for project updater
      })
      .select("title createdAt updatedAt createdBy updatedBy"); // Select project details

    console.log(project);

    // if (!project) return res.status(404).json({ message: "Project not found" });
    if (project) {
      // Map profile URLs for project creators and modifiers
      if (project.createdBy && project.createdBy.profile) {
        project.createdBy.profile = `/api/v1.0.0/uploads/profiles/${project.createdBy.profile}`;
      }

      if (project.updatedBy && project.updatedBy.profile) {
        project.updatedBy.profile = `/api/v1.0.0/uploads/profiles/${project.updatedBy.profile}`;
      }
    }

    // Return the note data along with the full project details
    res.status(200).json({
      success: true,
      data: {
        note,
        project, // Full project details
      },
    });
  } catch (error) {
    console.error("Error fetching note details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching note details",
      error: error.message,
      fullError: error, // Optional: for more detailed debugging
    });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  const { noteId } = req.params;
  const { userId } = req.user;

  try {
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Delete images from storage
    note.images.forEach((imagePath) => {
      const fullPath = fullFilePath("notes", imagePath.split("/").pop());
      deleteFile(fullPath);
    });

    // Log the delete activity before actually deleting
    await LoggingService.log({
      operation: "NOTE_DELETED",
      entityType: "NOTE",
      entityId: noteId,
      userId: userId,
      details: {
        title: note.title,
        project: note.project,
        images: note.images.length,
      },
      metadata: {
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.get("User-Agent") || "",
      },
      status: "SUCCESS",
    });

    await Note.findByIdAndDelete(noteId);

    res.status(200).json({
      message: "Note deleted successfully",
      data: {
        _id: noteId,
      },
    });
  } catch (error) {
    // Log delete failure
    await LoggingService.log({
      operation: "NOTE_DELETED",
      entityType: "NOTE",
      entityId: noteId,
      userId: req.user.userId,
      details: {
        error: error.message,
      },
      status: "FAILURE",
    });

    console.error("Error deleting note:", error);
    res
      .status(500)
      .json({ message: "Error deleting note", error: error.message });
  }
};

// Get all active notes for a user
export const getAllNotes = async (req, res) => {
  try {
    // Destructure query parameters
    const {
      page = 1,
      limit = 10,
      status,
      projectId,
      title,
      sortBy = "title",
      sortOrder = "asc",
    } = req.query;
    const userId = req.user.userId;

    // Step 1: Find projects where the user is the creator or a collaborator
    // Fetch the user's collaborator information
    const collaborator = await Collaborator.findOne({
      userId: userId, // Current logged-in user
    });

    let projectIds = [];

    if (collaborator) {
      // Get the list of project IDs where the user is a collaborator
      projectIds = collaborator.projects.map((project) => project.toString());
    }

    // Step 2: Include the project ID for projects created by the user as well
    const createdProjects = await Project.find({
      createdBy: userId, // Projects created by the logged-in user
    }).select("_id"); // Only select the project _id for efficiency

    // Add project IDs of created projects to the list of projectIds
    projectIds = [
      ...projectIds,
      ...createdProjects.map((project) => project._id.toString()),
    ];

    // Step 3: Build the filter for notes based on projectIds
    let filter = { status: "active" };

    // Add the project filter if projectId is passed
    if (projectId) {
      filter.project = projectId;
    } else if (projectIds.length > 0) {
      filter.project = { $in: projectIds }; // Only fetch notes related to these projects
    }

    // Add other filters
    if (status) {
      filter.status = status;
    }

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    // Step 4: Determine sorting order
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Step 5: Pagination and query execution
    const notes = await Note.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sortOptions) // Apply sorting
      .select("title content createdAt updatedAt status project images") // Select required fields
      .lean(); // Convert to plain JS objects for easier manipulation

    // Step 6: Get the total count of notes (for pagination)
    const totalNotes = await Note.countDocuments(filter);

    // Step 7: Calculate total pages
    const totalPages = Math.ceil(totalNotes / limit);

    // Step 8: Fetch project details for each note (since the note stores only project ids)
    const formattedNotes = await Promise.all(
      notes.map(async (note) => {
        // Fetch the project associated with the note
        const project = await Project.findById(note.project);
        return {
          ...note,
          project: {
            _id: project._id,
            title: project.title,
            description: project.description,
            createdBy: project.createdBy,
            status: project.status,
          },
        };
      })
    );

    // Step 9: Response with notes and pagination info
    res.status(200).json({
      data: formattedNotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        totalNotes,
      },
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({
      message: "Error fetching notes",
      error: error.message,
    });
  }
};

// Archive a note
export const archiveNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.status = "archived";
    await note.save();

    res.status(200).json({ message: "Note archived successfully", data: note });
  } catch (error) {
    console.error("Error archiving note:", error);
    res
      .status(500)
      .json({ message: "Error archiving note", error: error.message });
  }
};

// Unarchive a note
export const unarchiveNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.status !== "archived") {
      return res.status(400).json({ message: "Note is not archived" });
    }

    note.status = "active";
    await note.save();

    res
      .status(200)
      .json({ message: "Note unarchived successfully", data: note });
  } catch (error) {
    console.error("Error unarchiving note:", error);
    res
      .status(500)
      .json({ message: "Error unarchiving note", error: error.message });
  }
};

const checkCollaboratorPermission = async (
  projectId,
  userId,
  requiredPermissions
) => {
  // try {
  //   const collaboration = await Collaborator.findOne({
  //     project: projectId,
  //     user: userId,
  //     status: 'active'
  //   });

  //   if (!collaboration) return false;

  //   // Check if collaborator has all required permissions
  //   return requiredPermissions.every(perm =>
  //     collaboration.permissions.includes(perm)
  //   );
  // } catch (error) {
  //   console.error("Permission check error:", error);
  //   return false;
  // }
  return true;
};
