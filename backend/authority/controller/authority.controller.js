import { Authority } from "../model/authority.model.js";
import { Permission } from "../model/permission.model.js";

// Create Authority with Permissions
export const createAuthority = async (req, res) => {
  try {
    const data = req.body; // Request body: { viewer: [...], editor: [...], owner: [...] }
    const authorityResponses = [];

    for (const [authorityName, permissionNames] of Object.entries(data)) {
      // Save or find permissions
      const permissionIds = await Promise.all(
        permissionNames.map(async (permissionName) => {
          let permission = await Permission.findOne({ name: permissionName });
          if (!permission) {
            permission = new Permission({ name: permissionName });
            await permission.save();
          }
          return permission._id;
        })
      );

      // Save or update the authority
      let authority = await Authority.findOne({ name: authorityName });
      if (!authority) {
        authority = new Authority({
          name: authorityName,
          permissions: permissionIds,
        });
        await authority.save();
      } else {
        authority.permissions = permissionIds;
        await authority.save();
      }

      authorityResponses.push({
        [authority.name]: permissionNames,
      });
    }

    res.status(201).json({
      success: true,
      message: "Authorities and permissions saved successfully.",
      data: authorityResponses,
    });
  } catch (error) {
    console.error("Error creating authority and permissions:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating authorities and permissions.",
    });
  }
};

export const fetchAuthorities = async (req, res) => {
  try {
    // Fetch authorities and populate permissions
    const authorities = await Authority.find().populate("permissions");

    // Debugging: Log authorities to inspect the populated data
    console.log("Fetched Authorities:", authorities);

    // Format the response by mapping authority names to permission names
    const formattedResponse = authorities.reduce((acc, authority) => {
      // Check if permissions are populated
      if (authority.permissions && authority.permissions.length > 0) {
        acc[authority.name] = authority.permissions.map(
          (permission) => permission.name
        );
      } else {
        acc[authority.name] = []; // If no permissions found, return an empty array
      }
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: formattedResponse,
    });
  } catch (error) {
    console.error("Error fetching authorities and permissions:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching authorities and permissions.",
    });
  }
};

// Update Authority and Permissions
export const updateAuthority = async (req, res) => {
  try {
    const { authorityName } = req.params; // Get the authority name from the URL params
    const { viewer = [], editor = [], owner = [] } = req.body; // Default to empty arrays if not provided

    // Validate the permissions input for each role (viewer, editor, owner)
    if (
      !Array.isArray(viewer) ||
      !Array.isArray(editor) ||
      !Array.isArray(owner)
    ) {
      return res.status(400).json({
        success: false,
        message: "'permissions' must be an array of permission names.",
      });
    }

    // Find the authority by name
    const authority = await Authority.findOne({ name: authorityName }); // Find the authority by name
    if (!authority) {
      return res.status(404).json({
        success: false,
        message: "Authority not found.",
      });
    }

    // Fetch all existing permissions for this authority and remove all permissions
    authority.permissions = []; // Remove all current permissions

    // Combine all permissions into one array (viewer, editor, owner)
    const allPermissions = [...viewer, ...editor, ...owner];

    // Find and add the corresponding permissions from the Permissions collection
    const permissions = await Permission.find({
      name: { $in: allPermissions },
    });

    // Add the corresponding permissions to the authority
    authority.permissions = permissions.map((permission) => permission._id);

    // Save the updated authority with new permissions
    await authority.save();

    res.status(200).json({
      success: true,
      data: authority,
    });
  } catch (error) {
    console.error("Error updating authority and permissions:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating authority and permissions.",
    });
  }
};

// Delete Authority and Its Permissions
export const deleteAuthority = async (req, res) => {
  try {
    const { authorityName } = req.params; // Get the authority name from URL params

    // Find and delete the authority by its name
    const authority = await Authority.findOneAndDelete({ name: authorityName });

    if (!authority) {
      return res.status(404).json({
        success: false,
        message: "Authority not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Authority deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting authority:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting authority.",
    });
  }
};

// Fetch Authority by Name
export const fetchByName = async (req, res) => {
  try {
    const { name } = req.params; // Name of the authority to fetch

    const authority = await Authority.findOne({ name }).populate("permissions");

    if (!authority) {
      return res.status(404).json({
        success: false,
        message: "Authority not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        [authority.name]: authority.permissions.map(
          (permission) => permission.name
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching authority by name:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching authority by name.",
    });
  }
};
