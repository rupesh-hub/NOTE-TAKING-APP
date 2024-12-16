import express from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import { checkOwnershipMiddleware } from "../../middleware/permission-check.middleware.js";
const router = express.Router();

import {
  createProject,
  fetchProjectById,
  updateProject,
  deleteProject,
  getAllProjects,
  filterProjects,
  addCollaborators,
  removeCollaborators,
} from "../controller/project.controller.js";

router.post("/", authenticationMiddleware, createProject);
router.get("/by.id", authenticationMiddleware, fetchProjectById);
router.put(
  "/",
  authenticationMiddleware,
  checkOwnershipMiddleware,
  updateProject
);
router.delete(
  "/delete",
  authenticationMiddleware,
  checkOwnershipMiddleware,
  deleteProject
);
router.get("/", authenticationMiddleware, getAllProjects);
router.get("/filter/:query", authenticationMiddleware, filterProjects);
router.post(
  "/add-collaborators",
  authenticationMiddleware,
  checkOwnershipMiddleware,
  addCollaborators
);
router.post(
  "/remove-collaborators",
  authenticationMiddleware,
  checkOwnershipMiddleware,
  removeCollaborators
);

export default router;
