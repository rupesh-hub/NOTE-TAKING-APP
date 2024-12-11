const express = require("express");
const errorHandler = require("./middleware/ErrorHandler");
const connectDb = require("./config/DbConnection");
const upload = require('./config/FileUpload');
const Role = require("./models/RoleModel");
const { Permission, Authority } = require('./models/AuthorityModel');
require("dotenv").config();
const cors = require('cors');
const path = require('path');

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:4200',  // Frontend URL (adjust if needed)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Allow cookies to be sent with requests
};

connectDb();
const app = express();
app.use(cors(corsOptions));
const port = process.env.PORT || 3001;

// app.use('/uploads', express.static('uploads')); 
// Serve static files
app.use('/api/v1.0.0/uploads', express.static(path.join(__dirname, 'uploads')));

// MIDDLEWARE
app.use(express.json());
app.use("/api/v1.0.0/notes", require("./routes/NoteRoutes"));
app.use("/api/v1.0.0/drafts", upload.array('images', 10), require("./routes/DraftRoutes"));
app.use("/api/v1.0.0/users",upload.single('profile'), require("./routes/UserRoutes"));
app.use("/api/v1.0.0/projects", require("./routes/ProjectRoutes"));
app.use(errorHandler);

// Initialize authorities and permissions
const permissions = [
  { name: "view_project", description: "View projects" },
  { name: "create_project", description: "Create new projects" },
  { name: "edit_project", description: "Edit project details" },
  { name: "delete_project", description: "Delete projects" },
  { name: "view_note", description: "View notes within projects" },
  { name: "create_note", description: "Create new notes in projects" },
  { name: "edit_note", description: "Edit notes" },
  { name: "delete_note", description: "Delete notes" },
  { name: "manage_collaborators", description: "Add or remove collaborators" },
  {
    name: "assign_authorities",
    description: "Assign authorities to collaborators",
  },
];

const authorities = [
  {
    name: "Viewer",
    permissions: ["view_project", "view_note"],
  },
  {
    name: "Editor",
    permissions: [
      "view_project",
      "view_note",
      "create_note",
      "edit_note",
      "delete_note",
    ],
  },
  {
    name: "Owner",
    permissions: permissions.map((p) => p.name),
  },
];

// Function to initialize authorities and permissions
async function initializeAuthorities() {
  try {
    // Clear existing permissions and authorities
    await Permission.deleteMany({});
    await Authority.deleteMany({});

    // Insert permissions
    const createdPermissions = await Permission.insertMany(permissions);

    // Create authorities with references to permissions
    const authoritiesToCreate = authorities.map((auth) => ({
      name: auth.name,
      permissions: createdPermissions
        .filter((p) => auth.permissions.includes(p.name))
        .map((p) => p._id),
    }));

    await Authority.insertMany(authoritiesToCreate);

    console.log("Authorities and Permissions initialized successfully");
  } catch (error) {
    console.error("Error initializing authorities and permissions:", error);
  }
}

async function addRoleIfNotExists(roleName) {
  try {
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      await Role.create({ name: roleName });
      console.log(`Role '${roleName}' added to the database.`);
    }
  } catch (error) {
    console.error(`Error adding role '${roleName}':`, error.message);
  }
}

// Initialize roles and start the server
(async function initializeServer() {
  const rolesToAdd = ["admin", "user", "editor"];
  for (const roleName of rolesToAdd) {
    await addRoleIfNotExists(roleName);
  }

  // Initialize authorities and permissions
  initializeAuthorities();

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
})();
