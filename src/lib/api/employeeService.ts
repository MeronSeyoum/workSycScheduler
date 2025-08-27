// src/services/employeeService.ts
import { fetchWithAuth } from './apiBase';
import { CreateEmployeeDto, Employee, UpdateEmployeeDto } from "@/lib/types/employee";

export const fetchEmployees = async (token: string): Promise<Employee[]> => {
  try {
    const response = await fetchWithAuth<Employee[]>('/employees', {
      method: 'GET',
    }, token);
    
    // Handle both array and object responses
    const employees = Array.isArray(response) 
      ? response 
      : response.data || [];

    return employees;
  } catch (error) {
    console.error('Fetch employees error:', error);
    throw new Error('Failed to fetch employees');
  }
};

export const createEmployee = async (employeeData: CreateEmployeeDto, token: string): Promise<{ id: number }> => {
  const response = await fetchWithAuth<{ id: number }>('/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  }, token);
  return response.data || { id: 0 };
};

export const updateEmployee = async (id: number, employeeData: UpdateEmployeeDto, token: string): Promise<void> => {
  await fetchWithAuth(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  }, token);
};

export const deleteEmployee = async (id: number, token: string): Promise<void> => {
  await fetchWithAuth(`/employees/${id}`, {
    method: 'DELETE',
  }, token);
};