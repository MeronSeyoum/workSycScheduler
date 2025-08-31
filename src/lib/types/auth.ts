export interface User {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  is_login?: boolean;
  created_at?: Date;
  updated_at?: Date;

}

export interface AuthTokens {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

export interface AuthResponse {
  user: User;
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

// src/lib/types/auth.ts (or wherever ApiResponse is defined)
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  statusCode?: number;
  status?: number; // Add status property
}