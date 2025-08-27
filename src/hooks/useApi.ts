'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../lib/api/auth.service';
import { usersService } from '../lib/api/users.service';

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
  });
};

// Add more hooks as needed