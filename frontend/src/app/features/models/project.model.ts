export interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: User;
  createdAt: string;
  updatedBy: User;
  updatedAt: string;
  collaborators: Collaborator;
  notes: any;
  draft: any;
}

export interface Collaborator {
  _id: string;
  userId: string;
  authorities: any;
  createdAt: string;
  createdBy: User;
  updatedAt: string;
  updatedBy: User;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  images: [];
  urls: [];
  createdBy: User;
  createdAt: string;
  modifiedBy: User;
  modifiedAt: string;
  project: string;
}

export interface Authority {
  id: string;
  name: string;
  permission: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface User {
  profile: string;
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

export interface Draft {
  _id: string;
  title: string;
  content: string;
  urls: [];
  images: [];
  createdBy: User;
  modifiedBy: User;
  createdAt: string;
  modifiedAt: string;
  project: string;
}

export interface Image {
  _id: string;
  url: string;
  alt: string;
  draft: string;
  createdBy: User;
  modifiedBy: User;
  createdAt: string;
  moodifiedAt: string;
}
