const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Project = require("../models/ProjectModel");
const { Authority, Permission } = require("../models/AuthorityModel");
const Collaborator = require("../models/CollaboratorModel");

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Token missing or invalid format!" });
    }

    const token = header.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findById(decoded.user.id).populate("roles");

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user; // Attach user to the request
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Authorization error" });
  }
};

// const checkPermission = (requiredPermission) => {
//   return async (req, res, next) => {
//     try {
//       let id = req.headers['x-project-id'];
//       let project = await Project.findById(id).populate({
//         path: "collaborators",
//         populate: { path: "authorities" },
//       });

//       if (!project)
//         return res.status(404).json({ message: "Project not found" });

//       const userCollaborator = project.collaborators.find(
//         (c) => c.userId.toString() === req.user._id.toString()
//       );

//       const isCreator =
//         project.createdBy.toString() === req.user._id.toString();

//         console.log(userCollaborator)

//       if (
//         isCreator ||
//         (userCollaborator &&
//           userCollaborator.authorities &&
//           userCollaborator.authorities.some(
//             (a) =>
//               a.permissions &&
//               a.permissions.some((p) => p.name === requiredPermission)
//           ))
//       ) {
//         return next();
//       } else {
//         return res.status(403).json({ message: "Oops! Limited authority." });
//       }
//     } catch (error) {
//       console.error(error); // Log the error for debugging
//       res.status(500).json({ message: error.message });
//     }
//   };
// };

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      let projectId = req.headers['x-project-id'] || req.body.projectId || req.params.projectId;

      // Step 1: Fetch Project
      const project = await Project.findById(projectId)
        .populate('createdBy', '_id');

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Step 2: Check if user is creator
      const isCreator = project.createdBy.toString() === req.user._id.toString();
      if (isCreator) {
        return next();
      }

      // Step 3: Find collaborator
      const collaborator = await Collaborator.findOne({
        _id: { $in: project.collaborators },
        userId: req.user._id
      });

      if (!collaborator) {
        return res.status(403).json({ message: "Not a project collaborator" });
      }

      //4.
      const permissions = await findPermissionsByAuthorityId(collaborator.authorities[0]);
      console.log("Permissions=> ",permissions);

      // Step 5: Check permissions with detailed logging
      let hasPermission = false;
      // for (const authority of populatedAuthorities) {
      //   console.log(`Checking Authority ${authority.name}:`, {
      //     authorityId: authority._id,
      //     permissions: authority.permissions.map(p => p.name)
      //   });
        
      //   if (authority.permissions.some(permission => permission.name === requiredPermission)) {
      //     hasPermission = true;
      //     break;
      //   }
      // }

      if (hasPermission) {
        return next();
      }

      // return res.status(403).json({ 
      //   message: "Insufficient permissions",
      //   required: requiredPermission,
      //   availableAuthorities: populatedAuthorities.map(auth => ({
      //     name: auth.name,
      //     permissions: auth.permissions.map(p => p.name)
      //   }))
      // });
      return next();

    } catch (error) {
      console.error('Permission Check Error:', error);
      return res.status(500).json({ 
        message: "Error checking permissions",
        error: error.message,
        stack: error.stack
      });
    }
  };
};

const findPermissionsByAuthorityId = async (authorityId) => {
  try {
    //issue is here
    console.log(authorityId)
    const authority = await Authority.find({_id: authorityId}).populate('permissions');
    console.log(authority)

    if (!authority) {
      return { message: 'Authority not found' };
    }

    return authority.permissions;
  } catch (error) {
    console.error(error);
    return { message: 'Error retrieving permissions' };
  }
};

module.exports = { authenticate, checkPermission };
