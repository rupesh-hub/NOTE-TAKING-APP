import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./database/db.connection.js";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./user/routes/auth.route.js";
import { errorHandler } from "./exception/error.handler.js";
import cookieParser from "cookie-parser";
import projectRoutes from "./project/route/project.route.js";
import authorityRoutes from "./authority/route/authority.route.js";
import notesRoutes from "./note/route/note.routes.js";
import collaboratorRoutes from "./collaborator/route/collaborator.routes.js";
import userRoutes from "./user/routes/user.routes.js";
import { LoggingService } from "./activitylog/service/logging.service.js";
import loggingRoutes from "./activitylog/route/logging.routes.js";
import { socketAuthMiddleware } from "./middleware/socket-auth.middleware.js";
import { Note } from "./note/model/note.model.js";
import notificationRoutes from './notification/route/notification.routes.js';
import reviewsRoutes from './review/route/comment.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Credentials",
  ],
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Initialize logging service
LoggingService.initialize({ enableLogging: true });

// Define __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use("/api/v1.0.0/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/v1.0.0/auth", authRoutes);
app.use("/api/v1.0.0/users", userRoutes);
app.use("/api/v1.0.0/projects", projectRoutes);
app.use("/api/v1.0.0/authorities", authorityRoutes);
app.use("/api/v1.0.0/notes", notesRoutes);
app.use("/api/v1.0.0/collaborators", collaboratorRoutes);
app.use("/api/v1.0.0/logs", loggingRoutes);
app.use("/api/v1.0.0/notifications", notificationRoutes);
app.use("/api/v1.0.0/comments", reviewsRoutes);

// Error handling middleware
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true, // Allow cookies
  },
});
io.use(socketAuthMiddleware);

// Socket.IO connection handler
io.on("connection", (socket) => {
  let saveNoteTimeout;
  // Join a project room
  socket.on("join-project", (projectId) => {
    socket.join(projectId);
    // Notify others in the room about the new connection (optional)
    socket.to(projectId).emit("user-joined", {
      message: `A new user has joined project room: ${projectId}`,
    });
  });

  socket.on("join-review", (noteId) => {
    console.log(`User joined note room: ${noteId}`)
    socket.join(noteId);
  });

  // Handle real-time note updates
  socket.on("note-update", (updateData) => {
    try {
      const { noteId, projectId, updates } = updateData;

      // Ensure updates object is valid
      if (!updates || typeof updates !== "object") {
        throw new Error("Invalid updates object");
      }

      // Broadcast update to all users in the project room (except sender)
      socket.to(projectId).emit("note-updated", {
        noteId,
        updates,
        userId: socket.user?.userId || "anonymous", // Include user ID if available
      });

      // Debounce the save operation to prevent multiple database writes
      if (saveNoteTimeout) clearTimeout(saveNoteTimeout);

      saveNoteTimeout = setTimeout(async () => {
        await saveNoteToDatabase(noteId, updates);
      }, 500);
    } catch (error) {
      console.error("Error broadcasting note update:", error);

      // Notify the sender about the error
      socket.emit("update-error", {
        message: "Failed to broadcast note update",
        error: error.message,
      });
    }
  });

  socket.on("join-topic", () => {
    const email = socket.user.email;
    console.log("Joining room:", email);
    socket.join(email);
  });

  // Handle user disconnecting (optional)
  socket.on("disconnect", () => {
    console.log(`User disconnected`);
  });
});

// Start the server
server.listen(port, () => {
  connectDB();
  console.log(`Server is running on ${port}`);
});

// Function to save the note to the database
async function saveNoteToDatabase(noteId, updates) {
  try {
    const note = await Note.findOne({ _id: noteId });

    if (!note) {
      console.error("Note not found:", noteId);
      return;
    }

    // Update note fields
    note.content = updates.content || note.content;

    // Save the updated note
    await note.save();
  } catch (error) {}
}

// Export for potential use in other files
export { io, app, server };
