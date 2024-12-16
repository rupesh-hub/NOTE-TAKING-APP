// routes/collaboratorRoutes.js

import express from "express";
import {
  updateCollaboratorAuthorities,
  removeCollaboratorAuthorities,
} from "../controller/collaborator.controller.js";

const router = express.Router();
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import { checkOwnershipMiddleware } from "../../middleware/permission-check.middleware.js";

router.post(
  "/update-authorities",
  authenticationMiddleware,
  checkOwnershipMiddleware,
  updateCollaboratorAuthorities
);
router.post(
  "/remove-authorities",
  authenticationMiddleware,
  checkOwnershipMiddleware,
  removeCollaboratorAuthorities
);

export default router;
