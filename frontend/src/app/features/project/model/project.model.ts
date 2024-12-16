// models/project.model.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  images: string[];
}

export interface Authority {
  name: string;
  role: 'viewer' | 'editor' | 'owner'; // Define roles like viewer, editor, owner
}

export interface Permission {
  viewNote: boolean;
  editNote: boolean;
  deleteNote: boolean;
}

export interface Collaborator {
  id: string;
  name: string;
  profileImage: string;
  authorities: Authority[];
  permissions: Permission[];
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  notes: Note[];
  collaborators: Collaborator[];
  createdAt: string;
  updatedAt: string;
  createdBy:any;
  updatedBy: any;
}
