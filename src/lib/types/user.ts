// src/types/user.ts

export type UserRole = 'admin' | 'manager' | 'employee';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;  // Only for create/update operations
  salt?: string;      // Only for internal use
  role: UserRole;
  status: UserStatus;
  is_login: boolean;
  created_at: string;
  updated_at: string;
}

// For form submissions and API requests
export interface CreateUserForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirm: string;
  role: UserRole;
  status: UserStatus;
}

export interface UpdateUserForm {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface ChangePasswordForm {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface ResetPasswordForm {
  email: string;
}

export interface LoginForm {
  email: string;
  password: string;
  remember_me?: boolean;
}

// For API responses (excludes sensitive fields)
export interface SafeUser {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// For user lists (minimal fields)
export interface UserListItem {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}