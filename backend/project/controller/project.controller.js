import { Project } from "../model/project.model.js";
import mongoose from "mongoose";
import { Authority } from "../../authority/model/authority.model.js";
import { Note } from "../../note/model/note.model.js";
import { User } from "../../user/model/user.model.js";
import { Collaborator } from "../../collaborator/model/collaborator.model.js";
import { Permission } from "../../authority/model/permission.model.js";
import { deleteFile, fullFilePath } from "../../multer/file-management.js";
import fs from "fs";
import { io } from "../../server.js";
import { addNotification as addNotificationService } from '../../notification/service/notification.service.js';

export const createProject = async (req, res) => {
  const { title, description, collaborators } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Validate input
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required.",
      });
    }

    // Check if project with same title already exists for this user
    if (await Project.exists({ title, createdBy: req.user.userId })) {
      return res.status(400).json({
        success: false,
        message: "Project with the same title already exists.",
        timestamp: new Date(),
      });
    }

    // Find default authorities
    const viewerAuthority = await Authority.findOne({ name: "viewer" });
    const editorAuthority = await Authority.findOne({ name: "editor" });

    // Validate authorities exist
    if (!viewerAuthority || !editorAuthority) {
      throw new Error("Default authorities not found");
    }

    // Create project
    const project = new Project({
      title,
      description,
      createdBy: req.user.userId,
      updatedBy: req.user.userId,
      collaborators: [],
    });

    // Handle collaborators
    const projectCollaborators = [];

    if (collaborators && collaborators.length > 0) {
      for (const collab of collaborators) {
        // Validate email
        if (!collab.email) {
          throw new Error("Collaborator email is required");
        }

        // Find user by email
        const user = await User.findOne({ email: collab.email });
        if (!user) {
          throw new Error(`User with email ${collab.email} not found`);
        }

        // Prevent project owner from being added as a collaborator
        if (user._id.toString() === req.user.userId.toString()) {
          return res.status(400).json({
            success: false,
            message: "Project owner cannot be added as a collaborator.",
          });
        }

        // Determine authority (case-insensitive)
        const authorityName = collab.authority?.toLowerCase() || "viewer";
        const authority =
          authorityName === "editor" ? editorAuthority : viewerAuthority;

        // Check if a Collaborator document already exists for this user
        let collaboratorDoc = await Collaborator.findOne({
          userId: user._id,
        });

        // If collaborator doesn't exist, create a new one
        if (!collaboratorDoc) {
          collaboratorDoc = new Collaborator({
            userId: user._id,
            projects: [project._id],
            authorities: [authority._id],
            createdBy: req.user.userId,
            updatedBy: req.user.userId,
          });
        } else {
          // Check if project is already in collaborator's projects
          const isProjectExists = collaboratorDoc.projects.some(
            (p) => p.toString() === project._id.toString()
          );

          // Add project if not exists
          if (!isProjectExists) {
            collaboratorDoc.projects.push(project._id);
          }

          // Check if authority is already assigned
          const isAuthorityExists = collaboratorDoc.authorities.some(
            (a) => a.toString() === authority._id.toString()
          );

          // Add authority if not exists
          if (!isAuthorityExists) {
            collaboratorDoc.authorities.push(authority._id);
          }

          // Update the updatedBy field
          collaboratorDoc.updatedBy = req.user.userId;
        }

        // Save the collaborator document
        await collaboratorDoc.save({ session });

        // Add to project collaborators
        projectCollaborators.push({
          collaborator: collaboratorDoc._id,
          authority: authority._id,
        });
      }

      // Assign collaborators to the project
      project.collaborators = projectCollaborators;
    }

    // Save project
    await project.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project: {
        ...project._doc,
        createdBy: null,
        updatedBy: null,
      },
    });
  } catch (error) {
    await session.abortTransaction();

    res.status(500).json({
      success: false,
      message: "Server error while creating project.",
      error: error.message,
      details: error.stack,
    });
  } finally {
    session.endSession();
  }
};

export const fetchProjectById = async (req, res) => {
  try {
    const { projectId } = req.query;

    // Fetch project with detailed population
    const project = await Project.findById(projectId)
      .populate({
        path: "createdBy",
        select: "firstName lastName email profile",
      })
      .populate({
        path: "updatedBy",
        select: "firstName lastName email profile",
      })
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Helper function to format user information
    const formatUserInfo = (user) =>
      user
        ? {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            profile: user.profile
              ? `/api/v1.0.0/uploads/profiles/${user.profile}`
              : null,
          }
        : null;

    // Format createdBy and updatedBy
    project.createdBy = formatUserInfo(project.createdBy);
    project.updatedBy = formatUserInfo(project.updatedBy);

    // Fetch notes with detailed information
    const notes = await Note.find({
      project: projectId,
      status: "active",
    })
      .populate({
        path: "createdBy",
        select: "firstName lastName email profile",
      })
      .populate({
        path: "modifiedBy",
        select: "firstName lastName email profile",
      })
      .lean();

    // Format notes with user information
    const formattedNotes = notes.map((note) => ({
      ...note,
      createdBy: formatUserInfo(note.createdBy),
      modifiedBy: formatUserInfo(note.modifiedBy),
    }));

    // Fetch collaborator details with authorities and permissions
    const collaboratorDetails = await Promise.all(
      project.collaborators.map(async (collab) => {
        try {
          // Fetch collaborator record
          const collaborator = await Collaborator.findById(collab.collaborator)
            .select("userId projects authorities")
            .lean();

          if (!collaborator) return null;

          // Fetch user information using collaborator's userId
          const user = await User.findById(collaborator.userId)
            .select("firstName lastName email profile")
            .lean();

          if (!user) return null;

          // Fetch authority with permissions
          const authority = await Authority.findById(collab.authority)
            .populate("permissions")
            .lean();

          if (!authority) return null;

          // Prepare the response structure for authorities as an array
          return {
            user: {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              profile: user.profile
                ? `/api/v1.0.0/uploads/profiles/${user.profile}`
                : null,
              _id: user._id,
            },
            authorities: [
              {
                name: authority.name,
                permissions: authority.permissions.map((p) => p.name), // List permissions by name
              },
            ],
          };
        } catch (error) {
          console.error(
            `Error processing collaborator: ${collab.collaborator}`,
            error
          );
          return null;
        }
      })
    );

    // Filter out null collaborators
    const validCollaboratorDetails = collaboratorDetails.filter(
      (collab) => collab !== null
    );

    // Remove collaborators array from project
    const { collaborators, ...projectDetails } = project;

    // Prepare final response
    const projectResponse = {
      ...projectDetails,
      notes: formattedNotes,
      collaborators: validCollaboratorDetails,
    };

    res.json({
      success: true,
      project: projectResponse,
    });
  } catch (error) {
    console.error("Error in fetchProjectById:", error);
    res.status(500).json({
      success: false,
      message: "Project fetch error",
      error: error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  const { projectId } = req.query;
  const { title, description } = req.body;
  console.log(title, description, projectId);

  try {
    const project = await Project.findOneAndUpdate(
      {
        _id: projectId,
        createdBy: req.user.userId,
      },
      { title, description },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you're not the owner.",
      });
    }

    res.json({
      success: true,
      message: "Project updated successfully.",
      project: {
        ...project._doc,
        owner: null,
        collaborators: null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating project.",
      error: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = req.project;

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you're not the owner.",
      });
    }

    const projectId = project._id;

    // Step 1: Remove notes associated with the project
    const notes = await Note.find({ project: projectId });

    for (const note of notes) {
      // Delete images associated with each note
      if (note.images && note.images.length > 0) {
        for (const imageName of note.images) {
          const imagePath = fullFilePath("notes", imageName);
          deleteFile(imagePath); // Use helper to delete file
        }
      }
    }

    // Delete all notes associated with the project
    await Note.deleteMany({ project: projectId });

    // Step 2: Unlink collaborators from the project
    const collaborators = await Collaborator.find({ projects: projectId });
    for (const collaborator of collaborators) {
      collaborator.projects = collaborator.projects.filter(
        (id) => id.toString() !== projectId.toString()
      );
      await collaborator.save();
    }

    // Step 3: Delete uploaded project files
    const projectUploadPath = fullFilePath("projects", projectId.toString());
    if (fs.existsSync(projectUploadPath)) {
      fs.rmdirSync(projectUploadPath, { recursive: true });
    }

    // Step 4: Remove the project itself
    await project.deleteOne();

    // Return success response
    return res.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteProject:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting project.",
      error: error.message,
    });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId); // Current logged-in user's ID

    // Step 1: Fetch Projects where the user is the creator (createdBy)
    const createdProjects = await Project.find({
      createdBy: userId, // Projects created by the logged-in user
    });

    // Step 2: Fetch Collaborator document for the logged-in user
    const collaborator = await Collaborator.findOne({
      userId: userId, // Current logged-in user
    });

    if (!collaborator) {
      return res
        .status(404)
        .json({ message: "No collaborator found for this user." });
    }

    // Step 3: Get the projects associated with the collaborator
    const projectIds = collaborator.projects.map((project) =>
      project.toString()
    ); // Ensure project IDs are in the right format (String)

    // Step 4: Fetch Projects where the user is a collaborator
    const collaboratorProjects = await Project.find({
      _id: { $in: projectIds }, // Match projects from the collaborator's projects list
    });

    // Step 5: Merge both sets of projects and remove duplicates
    const allProjects = [...createdProjects, ...collaboratorProjects];
    const uniqueProjects = Array.from(
      new Set(allProjects.map((project) => project._id.toString()))
    ).map((id) => allProjects.find((project) => project._id.toString() === id));

    // Step 6: Format the response data
    const formattedProjects = await Promise.all(
      uniqueProjects.map(async (project) => {
        // Fetch the creator (createdBy) of the project
        const creator = await User.findById(project.createdBy);

        // Fetch the collaborator info for the current user (userId)
        const collaboratorInfo = collaborator.projects.filter(
          (p) => p.toString() === project._id.toString()
        )[0];

        return {
          _id: project._id,
          title: project.title,
          description: project.description,
          createdBy: {
            name: creator.firstName + " " + creator.lastName,
            email: creator.email,
            profile: creator.profile
              ? `/api/v1.0.0/uploads/profiles/${creator.profile}`
              : "",
          },
          collaborator: {
            name: req.user.firstName + " " + req.user.lastName, // Assuming `req.user` contains user details
            email: req.user.email,
            profile: req.user.profile
              ? `/api/v1.0.0/uploads/profiles/${req.user.profile}`
              : "",
          },
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        };
      })
    );

    // Return the formatted projects in the response
    res.json({
      success: true,
      message: "Projects fetched successfully.",
      projects: formattedProjects,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects.",
      error: error.message,
    });
  }
};

export const filterProjects = async (req, res) => {
  const query = req.params.query;
  const userId = new mongoose.Types.ObjectId(req.user.userId);

  try {
    const projects = await Project.find({
      title: { $regex: query, $options: "i" },
      $or: [{ createdBy: userId }, { collaborators: userId }],
    });

    res.json({
      success: true,
      message: "Projects fetched successfully.",
      projects: projects.map((project) => ({
        ...project._doc,
        createdBy: null,
        collaborators: null,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects.",
      error: error.message,
    });
  }
};

export const addCollaborators = async (req, res) => {
  const authenticatedUser = req.user;
  const authenticatedUserEmail = authenticatedUser.email;

  // Fetch the project
  const project = req.project;
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const collaboratorsData = req.body;

  try {
    // Use Promise.all for handling async operations for multiple collaborators
    const successResults = await Promise.all(
      Object.entries(collaboratorsData).map(async ([email, authorities]) => {
        // Check if the user is the authenticated user
        if (email === authenticatedUserEmail) {
          return {
            status: "error",
            message: "You cannot add yourself as a collaborator",
          };
        }

        // Default to 'viewer' authority if none provided
        if (!authorities || authorities.length === 0) {
          authorities = ["viewer"];
        }

        // Fetch and validate authorities
        const validAuthorities = await Promise.all(
          authorities.map(async (authorityName) => {
            const authority = await Authority.findOne({ name: authorityName });
            if (!authority) {
              throw new Error(
                `Authority '${authorityName}' not found in the database`
              );
            }
            return authority;
          })
        );

        // Fetch the permissions for each authority
        const permissionsPromises = validAuthorities.map(async (authority) => {
          const permissions = await Permission.find({
            _id: { $in: authority.permissions },
          });
          return permissions.map((permission) => permission.name); // Get the permission names
        });

        // Fetch the permissions for all authorities
        const permissions = await Promise.all(permissionsPromises);

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
          return {
            status: "error",
            message: `User with email '${email}' not found`,
          };
        }

        // Fetch the collaborator by userId
        let collaborator = await Collaborator.findOne({ userId: user._id });

        if (!collaborator) {
          // If collaborator doesn't exist, create a new collaborator
          collaborator = new Collaborator({
            userId: user._id,
            projects: [project._id], // Add project directly to the new collaborator
            authorities: validAuthorities.map((auth) => auth._id),
            updatedBy: authenticatedUser.userId,
            createdBy: authenticatedUser.userId,
          });
        } else {
          // If collaborator exists, add project to the collaborator's projects list
          collaborator.projects.addToSet(project._id);
          collaborator.authorities.addToSet(
            ...validAuthorities.map((auth) => auth._id)
          );
        }

        // Save the collaborator document (create new or update existing)
        await collaborator.save();

        // Update the project collaborators list
        const existingCollaborator = project.collaborators.find((c) =>
          c.collaborator.equals(collaborator._id)
        );
        if (existingCollaborator) {
          existingCollaborator.authority =
            validAuthorities[validAuthorities.length - 1]._id;
        } else {
          project.collaborators.push({
            collaborator: collaborator._id,
            authority: validAuthorities[validAuthorities.length - 1]._id,
          });
        }

        // Notify the individual user about being added as a collaborator
        const message = `You have been added to the project <strong>'${
          project.title
        }'</strong> by ${req.user.firstName} ${
          req.user.lastName
        } on date ${new Date()}.`;

        io.to(user.email).emit("collaborator-action", {
          project: {
            _id: project._id,
            title: project.title,
          },
          message: message,
          createdAt: new Date(),
          read: false,
          receiver: {
            _id: user._id,
            name: user.firstName + " " + user.lastName,
            email: user.email,
            profile: `/api/v1.0.0/uploads/profiles/${user.profile}` || "",
          },
          sender: {
            _id: authenticatedUser.userId,
            name:
              authenticatedUser.firstName + " " + authenticatedUser.lastName,
            email: authenticatedUser.email,
            profile:
              `/api/v1.0.0/uploads/profiles/${authenticatedUser.profile}` || "",
          },
        });

        await addNotificationService(
          project._id,
          message,
          user._id,
          authenticatedUser.userId
        );

        // Prepare the response data for the collaborator
        const collaboratorData = {
          user: {
            name: user.firstName + " " + user.lastName,
            email: user.email,
            profile: `/api/v1.0.0/uploads/profiles/${user.profile}` || "",
          },
          authorities: validAuthorities.map((authority, index) => ({
            name: authority.name,
            permissions: permissions[index], // Map permission names here
          })),
        };

        return {
          status: "success",
          message: "Collaborator added successfully",
          data: collaboratorData,
        };
      })
    );

    // Save the updated project
    await project.save();

    // Filter successful results and return them
    const successCollaborators = successResults.filter(
      (result) => result.status === "success"
    );

    if (successCollaborators.length === 1) {
      // If only one collaborator was successfully added, return it directly
      return res.status(200).json({
        success: true,
        data: successCollaborators[0].data,
      });
    }

    // If multiple collaborators were added, return an array of data
    return res.status(200).json({
      success: true,
      data: successCollaborators.map((result) => result.data),
    });
  } catch (error) {
    console.error("Error adding collaborators:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding collaborators.",
    });
  }
};

export const removeCollaborators = async (req, res) => {
  try {
    const project = req.project;
    const { email } = req.body;
    const authenticatedUser = req.user;

    // Find the collaborator using the user's ID
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .success(false)
        .json({
          success: false,
          message: `User not found with given email ${email}`,
        });
    }

    const collaborator = await Collaborator.findOne({ userId: user._id });
    if (!collaborator) {
      return res
        .status(404)
        .json({ success: false, message: "Collaborator not found" });
    }

    // Check if the collaborator is linked to the current project
    if (!collaborator.projects.includes(project._id)) {
      return res.status(400).json({
        success: false,
        message: "Collaborator is not linked with this project",
      });
    }

    // Unlink the collaborator from the project
    project.collaborators = project.collaborators.filter(
      (c) => c.collaborator.toString() !== collaborator._id.toString()
    );

    // Remove the project reference from the collaborator
    collaborator.projects.pull(project._id);

    // Save the collaborator document after removing the project reference
    await collaborator.save();

    // Save the project after removing the collaborator
    await project.save();

    // Notify the individual user about being removed as a collaborator
    const message = `You have been removed from the project <strong>'${
      project.title
    }'</strong>  by ${req.user.firstName} ${
      req.user.lastName
    } on date ${new Date()}.`;

    io.to(user.email).emit("collaborator-action", {
      project: {
        _id: project._id,
        title: project.title,
      },
      message: message,
      createdAt: new Date(),
      read: false,
      receiver: {
        _id: user._id,
        name: user.firstName + " " + user.lastName,
        email: user.email,
        profile: `/api/v1.0.0/uploads/profiles/${user.profile}` || "",
      },
      sender: {
        _id: authenticatedUser.userId,
        name: authenticatedUser.firstName + " " + authenticatedUser.lastName,
        email: authenticatedUser.email,
        profile:
          `/api/v1.0.0/uploads/profiles/${authenticatedUser.profile}` || "",
      },
    });
    await addNotificationService(
      project._id,
      message,
      user._id,
      authenticatedUser.userId
    );

    // Return a success response
    return res.json({
      success: true,
      message: "Collaborator removed successfully",
      data: {
        collaboratorId: user._id,
      },
    });
  } catch (error) {
    console.error("Error in removeCollaborators:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing collaborator",
      error: error.message,
    });
  }
};
