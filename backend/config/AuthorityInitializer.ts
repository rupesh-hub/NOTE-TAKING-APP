const { Authority } = require('../models/AuthorityModel');
const { Permission } = require('../models/AuthorityModel');

const permissions = [
  { name: 'view_project', description: 'View projects' },
  { name: 'create_project', description: 'Create new projects' },
  { name: 'edit_project', description: 'Edit project details' },
  { name: 'delete_project', description: 'Delete projects' },
  { name: 'view_note', description: 'View notes within projects' },
  { name: 'create_note', description: 'Create new notes in projects' },
  { name: 'edit_note', description: 'Edit notes' },
  { name: 'delete_note', description: 'Delete notes' },
  { name: 'manage_collaborators', description: 'Add or remove collaborators' },
  { name: 'assign_authorities', description: 'Assign authorities to collaborators' },
];

const authorities = [
  {
    name: 'Viewer',
    permissions: ['view_project', 'view_note'],
  },
  {
    name: 'Editor',
    permissions: ['view_project', 'view_note', 'create_note', 'edit_note', 'delete_note'],
  },
  {
    name: 'Project Manager',
    permissions: ['view_project', 'edit_project', 'view_note', 'create_note', 'edit_note', 'delete_note', 'manage_collaborators'],
  },
  {
    name: 'Owner',
    permissions: permissions.map(p => p.name),
  },
];

const AuthorityInitializer = async function initAuthorities() {
  try {
    // Clear existing permissions and authorities
    await Permission.deleteMany({});
    await Authority.deleteMany({});

    // Insert permissions
    const createdPermissions = await Permission.insertMany(permissions);

    // Create authorities with references to permissions
    const authoritiesToCreate = authorities.map(auth => ({
      name: auth.name,
      permissions: createdPermissions
        .filter(p => auth.permissions.includes(p.name))
        .map(p => p._id),
    }));

    await Authority.insertMany(authoritiesToCreate);

    console.log('Authorities and Permissions initialized successfully');
  } catch (error) {
    console.error('Error initializing authorities and permissions:', error);
  }
};

module.exports = AuthorityInitializer;
