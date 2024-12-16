import express from "express";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";
import {
  createComment,
  getCommentsByEntityId,
} from "../controller/comment.controller.js";
const router = express.Router();

router.post("/", authenticationMiddleware, createComment);
router.get("/:entity/:entityId", authenticationMiddleware, getCommentsByEntityId);

export default router;
