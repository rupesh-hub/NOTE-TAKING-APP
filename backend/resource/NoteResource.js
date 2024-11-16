const asyncHandler = require("express-async-handler");
const Note = require("../models/NoteModel");

//@desc GET ALL NOTES
//@route GET /api/v1.0.0/notes
//@access private
const getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user_id: req.user.id });
  res.status(200).json(notes);
});

//@desc CREATE NEW NOTE
//@route POST /api/v1.0.0/notes
//@access private
const createNote = asyncHandler(async (req, res) => {
  const { projectId, title, content } = req.body;
  if (!projectId || !title || !content) {
    res.status(400);
    throw new Error("All fields are mandatory!!");
  }

  const note = await Note.create({
    projectId,
    title,
    content,
    user_id: req.user.id,
  });
  res.status(201).json(note);
});

//@desc GET NOTE BY ID
//@route GET /api/v1.0.0/notes/:id
//@access private
const getNoteById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const note = await Note.findById(id);
  if (!note) {
    res.status(404);
    throw new Error(`Note by id ${id} not found`);
  }
  res.status(201).json(note);
});

//@desc UPDATE NOTE
//@route PUT /api/v1.0.0/notes/:id
//@access private
const updateNote = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const note = await Note.findById(id);
  if (!note) {
    res.status(404);
    throw new Error(`Note by id ${id} not found`);
  }

  if (note.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error(
      `User don't have permission to update other user notes.`
    );
  }

  const updatedNote = await Note.findByIdAndUpdate(id, req.body, { new: true });

  res.status(201).json(updateNote);
});

//@desc DELETE NOTE
//@route DELETE /api/v1.0.0/notes/:id
//@access private
const deleteNote = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const note = await Note.findById(id);
  if (!note) {
    res.status(404);
    throw new Error(`Note by id ${id} not found`);
  }

  if (note.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error(
      `User don't have permission to delete other user notes.`
    );
  }

  await Note.remove();

  res
    .status(200)
    .json({ message: `Note deleted successfully ${req.params.id}` });
});

module.exports = { getNotes, createNote, getNoteById, updateNote, deleteNote };



