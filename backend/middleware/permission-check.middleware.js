import { Project } from "../project/model/project.model.js";
// import { Collaborator } from "../collaborator/model/collaborator.model.js";

// Enum for Permissions
// export const Permissions = {
//   VIEW_NOTE: "VIEW_NOTE",
//   CREATE_NOTE: "CREATE_NOTE",
//   EDIT_NOTE: "EDIT_NOTE",
//   DELETE_NOTE: "DELETE_NOTE",
//   VIEW_COLLABORATORS: "VIEW_COLLABORATORS",
//   MANAGE_COLLABORATORS: "MANAGE_COLLABORATORS",
//   VIEW_PROJECT: "VIEW_PROJECT",
//   EDIT_PROJECT: "EDIT_PROJECT",
//   DELETE_PROJECT: "DELETE_PROJECT",
// };

// export const permissionCheckMiddleware = async (req, res, next) => {
//   const userId = req.user.userId;
//   const method = req.method;
//   const uri = req.originalUrl;

//   // Whitelist routes without permission checks
//   const whitelistedRoutes = [
//     { path: "/projects/create", method: "POST" },
//     { path: "/projects/all", method: "GET" },
//     { path: "/notes/all", method: "GET" },
//     { path: "/authorities", method: "GET" },
//   ];

//   if (
//     whitelistedRoutes.some(
//       (route) => uri.includes(route.path) && method === route.method
//     )
//   ) {
//     return next();
//   }

//   console.log(`Checking permissions for user: ${userId} on ${method} ${uri}`);

//   const { projectId, noteId, draftId } = {
//     ...req.params,
//     ...req.query,
//     ...req.body,
//   };

//   if (!projectId && !uri.endsWith("/projects") && method !== "POST") {
//     console.log("Project ID not found in the request");
//     return res.status(403).json({
//       timestamp: new Date().toISOString(),
//       uri: req.originalUrl,
//       method: req.method,
//       message: "Invalid request: Project ID is missing",
//     });
//   }

//   // Check if user is project owner
//   const project = await Project.findOne({
//     projectId: projectId,
//     createdBy: userId,
//   });

//   if (project) {
//     return next(); // Project owner has full access
//   }

//   // Find collaborator
//   const collaborator = await Collaborator.findOne({
//     userId: userId,
//     projectId: projectId,
//   }).populate("authorities");

//   if (!collaborator) {
//     console.log(
//       `User ${username} is not a collaborator on project ${projectId}`
//     );
//     return res.status(403).json({
//       timestamp: new Date().toISOString(),
//       uri: req.originalUrl,
//       method: req.method,
//       message: "You do not have permission to access this project.",
//     });
//   }

//   const isAuthorized = checkAuthorization(
//     collaborator.authorities,
//     method,
//     uri,
//     noteId,
//     draftId,
//     collaborator
//   );

//   if (!isAuthorized) {
//     logger.warn(
//       `User ${username} with role ${collaborator.authorities.map(
//         (a) => a.name
//       )} is not authorized to perform ${method} on ${uri}`
//     );
//     return res.status(403).json({
//       timestamp: new Date().toISOString(),
//       uri: req.originalUrl,
//       method: req.method,
//       message: "You are not authorized to perform this action",
//     });
//   }

//   next();
// };

// function checkAuthorization(
//   authorities,
//   method,
//   uri,
//   noteId,
//   draftId,
//   collaborator
// ) {
//   const authorityNames = authorities.map((a) => a.name);
//   const permissions = authorities.flatMap((a) =>
//     a.permissions.map((p) => p.name)
//   );

//   const endpointType = getEndpointType(uri);

//   switch (endpointType) {
//     case "NOTES":
//       return checkNotePermissions(
//         method,
//         permissions,
//         authorityNames,
//         noteId,
//         collaborator
//       );
//     case "COLLABORATORS":
//       return checkCollaboratorPermissions(method, permissions);
//     case "DRAFTS":
//       return checkDraftPermissions(
//         method,
//         permissions,
//         authorityNames,
//         draftId,
//         collaborator
//       );
//     case "PROJECT":
//       return checkProjectPermissions(method, permissions);
//     default:
//       return false;
//   }
// }

// function getEndpointType(uri) {
//   if (uri.endsWith("/notes") || uri.includes("/notes/")) return "NOTES";
//   if (uri.includes("/collaborators")) return "COLLABORATORS";
//   if (uri.includes("/drafts")) return "DRAFTS";
//   return "PROJECT";
// }

// function checkNotePermissions(
//   method,
//   permissions,
//   authorities,
//   noteId,
//   collaborator
// ) {
//   switch (method.toUpperCase()) {
//     case "GET":
//       return permissions.includes(Permissions.VIEW_NOTE);
//     case "POST":
//       return permissions.includes(Permissions.CREATE_NOTE);
//     case "PUT":
//       return permissions.includes(Permissions.EDIT_NOTE);
//     case "DELETE":
//       return authorities.includes("EDITOR")
//         ? permissions.includes(Permissions.DELETE_NOTE) &&
//             isNoteOwnedByCollaborator(noteId, collaborator.id)
//         : permissions.includes(Permissions.DELETE_NOTE);
//     default:
//       return false;
//   }
// }

// function checkCollaboratorPermissions(method, permissions) {
//   return method.toUpperCase() === "GET"
//     ? permissions.includes(Permissions.VIEW_COLLABORATORS)
//     : permissions.includes(Permissions.MANAGE_COLLABORATORS);
// }

// function checkDraftPermissions(
//   method,
//   permissions,
//   authorities,
//   draftId,
//   collaborator
// ) {
//   switch (method.toUpperCase()) {
//     case "GET":
//       return permissions.includes(Permissions.VIEW_NOTE);
//     case "POST":
//       return permissions.includes(Permissions.CREATE_NOTE);
//     case "PUT":
//       return permissions.includes(Permissions.EDIT_NOTE);
//     case "DELETE":
//       return authorities.includes("EDITOR")
//         ? permissions.includes(Permissions.DELETE_NOTE) &&
//             isDraftOwnedByCollaborator(draftId, collaborator.id)
//         : permissions.includes(Permissions.DELETE_NOTE);
//     default:
//       return false;
//   }
// }

// function checkProjectPermissions(method, permissions) {
//   switch (method.toUpperCase()) {
//     case "GET":
//       return permissions.includes(Permissions.VIEW_PROJECT);
//     case "PUT":
//     case "DELETE":
//       return (
//         permissions.includes(Permissions.EDIT_PROJECT) ||
//         permissions.includes(Permissions.DELETE_PROJECT)
//       );
//     default:
//       return false;
//   }
// }

// // These functions would be implemented in your service layer
// async function isNoteOwnedByCollaborator(noteId, collaboratorId) {
//   // Implementation to check if note is owned by collaborator
// }

// async function isDraftOwnedByCollaborator(draftId, collaboratorId) {
//   // Implementation to check if draft is owned by collaborator
// }

export const checkOwnershipMiddleware = async (req, res, next) => {
  try {
    const projectId = req.params?.projectId || req.query?.projectId;
    const userId = req.user.userId;

    const project = await Project.findOne({
      _id: projectId,
      createdBy: userId,
    });

    if (!project) {
      return res.status(403).json({
        message: "You are not authorized to modify this project",
        timestamp: new Date().toISOString(),
      });
    }
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({
      message: "Internal server error during project ownership check",
      error: error.message,
    });
  }
};
