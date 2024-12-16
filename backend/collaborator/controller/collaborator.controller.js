import { Authority } from "../../authority/model/authority.model.js";
import { Collaborator } from "../../collaborator/model/collaborator.model.js";
import mongoose from "mongoose";

export const updateCollaboratorAuthorities = async (req, res) => {
  try {
    const collaboratorsData = req.body;
    const projectId = req.project._id;

    const results = await Promise.all(
      collaboratorsData.map(async (collaboratorData) => {
        const userId = new mongoose.Types.ObjectId(
          Object.keys(collaboratorData)[0]
        );
        const authorities = collaboratorData[userId];

        // Check if the collaborator is assigned to the project
        const collaboratorExists = await Collaborator.findOne({
          userId,
          projects: projectId,
        });

        if (!collaboratorExists) {
          return {
            userId,
            status: "failed",
            message: "Collaborator is not assigned to this project.",
          };
        }

        // Update authorities
        const authorityIds = await Promise.all(
          authorities.map(async (authorityName) => {
            let authority = await Authority.findOne({ name: authorityName });
            if (!authority) {
              authority = new Authority({
                name: authorityName,
                permissions: [], // Define permissions as needed
              });
              await authority.save();
            }
            return authority._id;
          })
        );

        // Update collaborator authorities
        collaboratorExists.authorities = authorityIds;
        await collaboratorExists.save();

        return {
          userId,
          status: "success",
          message: "Authorities updated successfully",
        };
      })
    );

    res.json({ success: true, results });
  } catch (error) {
    console.error("Error in updateCollaboratorAuthorities:", error);
    res.status(500).json({
      success: false,
      message: "Error updating collaborator authorities",
      error: error.message,
    });
  }
};

export const removeCollaboratorAuthorities = async (req, res) => {
  try {
    const collaboratorsData = req.body; 
    const projectId = req.project._id;

    const results = await Promise.all(
      collaboratorsData.map(async (collaboratorData) => {
        const userIdKey = Object.keys(collaboratorData)[0];
        const authoritiesToRemove = collaboratorData[userIdKey];

        // Validate `userId`
        if (!mongoose.Types.ObjectId.isValid(userIdKey)) {
          return {
            userId: userIdKey,
            status: "failed",
            message: "Invalid userId format",
          };
        }

        const userId = new mongoose.Types.ObjectId(userIdKey);

        // Check if the collaborator is assigned to the project
        const collaborator = await Collaborator.findOne({
            userId,
            projects: projectId,
          });

  
        if (!collaborator) {
          return {
            userId,
            status: "error",
            message: "Collaborator not found",
          };
        }

        // Find the authorities to remove
        const authoritiesToRemoveIds = await Authority.find({
          name: { $in: authoritiesToRemove },
        }).distinct("_id");

        if (!authoritiesToRemoveIds.length) {
          return {
            userId,
            status: "error",
            message: "No matching authorities found for removal",
          };
        }

        // Remove the authorities
        collaborator.authorities = collaborator.authorities.filter(
          (auth) => !authoritiesToRemoveIds.some((id) => id.equals(auth))
        );
        await collaborator.save();

        return {
          userId,
          status: "success",
          message: "Authorities removed successfully",
        };
      })
    );

    res.json({ success: true, results });
  } catch (error) {
    console.error("Error in removeCollaboratorAuthorities:", error);
    res.status(500).json({
      success: false,
      message: "Error removing collaborator authorities",
      error: error.message,
    });
  }
};
