// src/services/apiBase.ts

import { ApiResponse } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL  || 'http://localhost:8080/api/v1';

interface FetchOptions extends RequestInit {
  responseType?: 'json' | 'blob';
}

// src/services/apiBase.ts
export async function fetchWithAuth<T = any>(
  endpoint: string,
  options: FetchOptions = {},
  token?: string
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  const { responseType = 'json', ...fetchOptions } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || 'Request failed');
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    // Standardize response handling
    const result: ApiResponse<T> = {
      status: response.status,
    };

    if (responseType === 'blob') {
      result.data = await response.blob() as any;
    } else {
      const jsonData = await response.json();
      
      // If response has direct data property
      if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
        Object.assign(result, jsonData);
      } else {
        // Treat the entire response as data
        result.data = jsonData;
      }
    }

    return result;
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }

}