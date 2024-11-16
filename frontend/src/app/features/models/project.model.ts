export interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: any;
  createdAt: string;
  updatedBy: any;
  updatedAt: string;
  collaborators: any;
  notes: any;
}

export interface Collaborator {
  id: string;
  userId: string;
  authorities: any;
  createdAt: string;
  createdBy: any;
  updatedAt: string;
  updatedBy: any;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  images: any;
  urls: any;
  createdBy: any;
  createdAt: string;
  modifiedBy: any;
  modifiedAt: string;
  project: any;
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
