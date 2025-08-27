// lib/types/api.ts
export interface ApiResponse<T = any> {
  status: number;
  data: T;
  message?: string;
}

export interface QueryParams {
  endpoint: string;
  params?: any;
}

export interface MutationParams<T = any> {
  endpoint: string;
  method?: string;
  data?: T;
}

// Then update your QueryProvider types accordingly