import { fetchWithAuth } from './apiBase';
import { Task, CreateTaskData, UpdateTaskData, TaskFilters } from "@/lib/types/task";

export const fetchTasks = async (token: string, filters?: TaskFilters): Promise<Task[]> => {
  const queryParams = new URLSearchParams();
  
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.client_id) queryParams.append('client_id', filters.client_id.toString());
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.requires_photo !== undefined) queryParams.append('requires_photo', filters.requires_photo.toString());
  if (filters?.client_specific !== undefined) queryParams.append('client_specific', filters.client_specific.toString());

  const url = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const response = await fetchWithAuth<Task[]>(url, {
    method: 'GET',
  }, token);
  return response.data || [];
};

export const getTaskById = async (token: string, id: string): Promise<Task> => {
  const response = await fetchWithAuth<Task>(`/tasks/${id}`, {
    method: 'GET',
  }, token);
  return response.data!;
};

export const createTask = async (token: string, taskData: CreateTaskData): Promise<Task> => {
  const response = await fetchWithAuth<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }, token);
  return response.data!;
};

export const updateTask = async (token: string, id: string, taskData: UpdateTaskData): Promise<Task> => {
  const response = await fetchWithAuth<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  }, token);
  return response.data!;
};

export const deleteTask = async (token: string, id: string): Promise<void> => {
  await fetchWithAuth(`/tasks/${id}`, {
    method: 'DELETE',
  }, token);
};

export const getGeneralTasks = async (token: string): Promise<Task[]> => {
  const response = await fetchWithAuth<Task[]>('/tasks/general', {
    method: 'GET',
  }, token);
  return response.data || [];
};

export const getClientTasks = async (token: string, clientId: number): Promise<Task[]> => {
  const response = await fetchWithAuth<Task[]>(`/tasks/client/${clientId}`, {
    method: 'GET',
  }, token);
  return response.data || [];
};

export const getTasksForShift = async (token: string, clientId: number): Promise<Task[]> => {
  // Get both general tasks and client-specific tasks
  const [generalTasks, clientTasks] = await Promise.all([
    getGeneralTasks(token),
    getClientTasks(token, clientId)
  ]);
  
  return [...generalTasks, ...clientTasks].filter(task => task.status === 'active');
};