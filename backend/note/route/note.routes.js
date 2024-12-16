import express from "express";
import { noteImagesUploadMiddleware } from "../../multer/multer.configuration.js";
import * as noteController from "../controller/note.controller.js";
import { authenticationMiddleware } from "../../middleware/authentication.middleware.js";

const router = express.Router();

// Create a new note
router.post("/",authenticationMiddleware, noteImagesUploadMiddleware, noteController.createNote);

// Update an existing note
router.put("/:noteId",authenticationMiddleware, noteImagesUploadMiddleware, noteController.updateNote);

// Get details of a specific note
router.get("/:noteId",authenticationMiddleware, noteController.getNoteDetails);

// Delete a specific note
router.delete("/:noteId",authenticationMiddleware, noteController.deleteNote);

// Get all notes for a user
router.get("/",authenticationMiddleware, noteController.getAllNotes);

// Archive a specific note
router.put("/archive/:noteId",authenticationMiddleware, noteController.archiveNote);

// Unarchive a specific note
router.put("/unarchive/:noteId",authenticationMiddleware, noteController.unarchiveNote);
export default router;
