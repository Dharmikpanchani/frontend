export interface addRole {
  id?: string;
  role: string;
}

export interface getRole {
  _id: string;
  role: string;
  isDeleted: boolean;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
  permissions: string[];
  __v: number;
}
export interface addAdminUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface getAdminUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: {
    _id: string;
    role: string;
  };
  isDeleted: boolean;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
  __v: number;
}
