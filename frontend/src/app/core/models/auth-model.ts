export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roles: any;
  createdAt: string;
  createdBy: any;
  updatedAt: string;
  updatedBy: any;
}

export interface Role {
  id: string;
  name: string;
  createAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface UserFilterResponse {
  _id:any;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profile: string;
}

export interface Authority{
  name:string;
  _id: string;
}

