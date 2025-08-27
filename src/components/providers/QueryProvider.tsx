'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';
import { fetchWithAuth } from '@/lib/api/apiBase';
import { useAuth } from './AuthProvider';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, checkSessionValidity } = useAuth();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            queryFn: async ({ queryKey }) => {
              const [endpoint, params] = queryKey as [string, any];
              
              // Validate session before making request
              if (isAuthenticated) {
                const isValidSession = await checkSessionValidity();
                if (!isValidSession) {
                  throw new Error('Session expired');
                }
              }

              const response = await fetchWithAuth(
                endpoint,
                {
                  method: 'GET',
                  ...(params && { body: JSON.stringify(params) }),
                },
                token || undefined
              );
              
              if (!response.success) {
                throw new Error(response.message || 'Request failed');
              }
              
              return response.data;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error: any) => {
              // Don't retry on 401 (unauthorized) or session expiration
              if (error?.status === 401 || error?.message === 'Session expired') {
                return false;
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: true,
            enabled: isAuthenticated, // Only enable queries if authenticated
          },
          mutations: {
            mutationFn: async (variables: {
              endpoint: string;
              method?: string;
              data?: any;
            }) => {
              const { endpoint, method = 'POST', data } = variables;
              
              // Validate session before making request
              if (isAuthenticated) {
                const isValidSession = await checkSessionValidity();
                if (!isValidSession) {
                  throw new Error('Session expired');
                }
              }

              const response = await fetchWithAuth(
                endpoint,
                {
                  method,
                  body: JSON.stringify(data),
                },
                token || undefined
              );
              
              if (!response.success) {
                throw new Error(response.message || 'Request failed');
              }
              
              return response.data;
            },
            retry: false, // Typically don't retry mutations
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}