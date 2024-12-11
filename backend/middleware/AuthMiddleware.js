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

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      let id = req.headers['x-project-id'];
      let project = await Project.findById(id).populate({
        path: "collaborators",
        populate: { path: "authorities" },
      });

      if (!project)
        return res.status(404).json({ message: "Project not found" });

      const userCollaborator = project.collaborators.find(
        (c) => c.userId.toString() === req.user._id.toString()
      );

      const isCreator =
        project.createdBy.toString() === req.user._id.toString();

        console.log(userCollaborator)

      if (
        isCreator ||
        (userCollaborator &&
          userCollaborator.authorities &&
          userCollaborator.authorities.some(
            (a) =>
              a.permissions &&
              a.permissions.some((p) => p.name === requiredPermission)
          ))
      ) {
        return next();
      } else {
        return res.status(403).json({ message: "Oops! Limited authority." });
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: error.message });
    }
  };
};

module.exports = { authenticate, checkPermission };
