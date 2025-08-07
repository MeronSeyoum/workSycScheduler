import { Client } from "@/types/client";
import { CreateEmployeeDto, Employee, UpdateEmployeeDto, User } from "@/types/employee";
import { CreateShiftWithEmployeesDto, EmployeeShift, Shift, ShiftWithEmployees, UpdateShiftDto } from "@/types/shift";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  statusCode?: number;
}

// Update the fetchWithAuth function to handle the direct array response
async function fetchWithAuth<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Request failed');
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    // Handle direct array responses
    return Array.isArray(data) 
      ? { data } 
      : { message: data.message, data: data.data };
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

// Auth API
export const login = async (email: string, password: string) => {
  return fetchWithAuth<{
    user: User;
    access: { token: string; expires: string };
    refresh: { token: string; expires: string };
  }>('/auth/signIn', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const logout = async (token: string) => {
  return fetchWithAuth('/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const getCurrentUser = async (token: string) => {
  return fetchWithAuth<User>('/auth/getUser', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const refreshToken = async (refreshToken: string) => {
  return fetchWithAuth<{
    user: User;
    access: { token: string; expires: string };
    refresh: { token: string; expires: string };
  }>('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
};

// user API
// User API
export const updateUser = async (id: number, values: Partial<User>, token: string): Promise<User> => {
  const response = await fetchWithAuth<User>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(values)
  }, token);
  return response.data!;
};

export const uploadUserAvatar = async (formData: FormData, token: string): Promise<User> => {
  const response = await fetch(`${API_URL}/users/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  return await response.json();
};

// Auth API
export const changePassword = async (
  currentPassword: string, 
  newPassword: string, 
  token: string
): Promise<void> => {
  await fetchWithAuth('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword })
  }, token);
};

// Employee API
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


export const fetchClients = async (token: string): Promise<Client[]> => {
  const response = await fetchWithAuth<Client[]>('/clients', {
    method: 'GET',
  }, token);
  return response.data || [];
};

export const getClientById = async (id: number, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>(`/clients/${id}`, {
    method: 'GET',
  }, token);
  return response.data!;
};

export const createClient = async (clientData: Omit<Client, 'id'>, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify(clientData),
  }, token);
  return response.data!;
};

export const updateClient = async (id: number, clientData: Partial<Client>, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  }, token);
  return response.data!;
};

export const deleteClient = async (id: number, token: string): Promise<void> => {
  await fetchWithAuth(`/clients/${id}`, {
    method: 'DELETE',
  }, token);
};

// Location methods
export const addClientLocation = async (clientId: number, locationData: any, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>(`/clients/${clientId}/locations`, {
    method: 'POST',
    body: JSON.stringify(locationData),
  }, token);
  return response.data!;
};

export const updateClientLocation = async (clientId: number, locationId: string, locationData: any, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>(`/clients/${clientId}/locations/${locationId}`, {
    method: 'PUT',
    body: JSON.stringify(locationData),
  }, token);
  return response.data!;
};

export const removeClientLocation = async (clientId: number, locationId: string, token: string): Promise<Client> => {
  const response = await fetchWithAuth<Client>(`/clients/${clientId}/locations/${locationId}`, {
    method: 'DELETE',
  }, token);
  return response.data!;
};

// Add to your api.ts file
// api/shift.ts
export const fetchShifts = async (
  params: {
    clientId?: number;
    employeeId?: number;
    startDate?: string;
    endDate?: string;
    status?: 'scheduled' | 'completed' | 'missed';
  },
  token: string
): Promise<ShiftWithEmployees[]> => {
  const query = new URLSearchParams();
  
  if (params.clientId) query.append('clientId', params.clientId.toString());
  if (params.employeeId) query.append('employeeId', params.employeeId.toString());
  if (params.startDate) query.append('startDate', params.startDate);
  if (params.endDate) query.append('endDate', params.endDate);
  if (params.status) query.append('status', params.status);

  try {
    const response = await fetchWithAuth<ShiftWithEmployees[]>(
      `/shifts?${query.toString()}`,
      { 
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.data) {
      throw new Error('Failed to fetch shifts');
    }

    return response.data || [];
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
};

export const getShiftById = async (
  id: number,
  token: string
): Promise<ShiftWithEmployees> => {
  const response = await fetchWithAuth<ShiftWithEmployees>(
    `/shifts/${id}`,
    { method: 'GET' },
    token
  );
  return response.data!;
};

export const createShift = async (
  shiftData: CreateShiftWithEmployeesDto, 
  token: string
): Promise<{ shift: Shift; employeeShifts: EmployeeShift[] }> => {
  const payload = {
    client_id: Number(shiftData.client_id),
    date: shiftData.date,
    start_time: shiftData.start_time,
    end_time: shiftData.end_time,
    shift_type: shiftData.shift_type || 'regular',
    employee_ids: shiftData.employee_ids.map(id => Number(id)),
    notes: shiftData.notes || undefined
  };

  const response = await fetchWithAuth<{
    shift: Shift;
    employeeShifts: EmployeeShift[];
    warnings?: string[];
  }>(
    '/shifts',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    },
    token
  );

  if (!response.data) {
    throw new Error(response.message || 'Failed to create shift');
  }

  // Handle partial success with warnings
  if (response.data.warnings && response.data.warnings.length > 0) {
    console.warn('Shift created with warnings:', response.data.warnings);
    // You might want to show these warnings to the user
  }

  return {
    shift: response.data.shift,
    employeeShifts: response.data.employeeShifts
  };
};

export const updateShift = async (
  id: number,
  shiftData: UpdateShiftDto,
  token: string
): Promise<ShiftWithEmployees> => {
  const response = await fetchWithAuth<ShiftWithEmployees>(
    `/shifts/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(shiftData),
    },
    token
  );
  return response.data!;
};

export const deleteShift = async (
  id: number,
  token: string
): Promise<void> => {
  await fetchWithAuth(
    `/shifts/${id}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    },
    token
  );
};

export const createRecurringShifts = async (
  recurringData: RecurringShiftDtp,
  token: string
): Promise<{ shifts: Shift[]; employeeShifts: EmployeeShift[] }> => {
  const response = await fetchWithAuth<{
    shifts: Shift[];
    employeeShifts: EmployeeShift[];
    warnings?: string[];
  }>(
    '/shifts/recurring',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...recurringData,
        employee_ids: recurringData.employee_ids.map(id => Number(id)),
        client_id: Number(recurringData.client_id)
      }),
    },
    token
  );

  if (!response.data) {
    throw new Error(response.message || 'Failed to create recurring shifts');
  }

  // Handle partial success with warnings
  if (response.data.warnings && response.data.warnings.length > 0) {
    console.warn('Recurring shifts created with warnings:', response.data.warnings);
  }

  return {
    shifts: response.data.shifts,
    employeeShifts: response.data.employeeShifts
  };
};

export const getLocationShiftStats = async (
  locationId: number,
  startDate?: string,
  endDate?: string,
  token?: string
): Promise<{
  totalShifts: number;
  uniqueEmployees: number;
  uniquePositions: number;
  shiftsByDay: Record<string, number>;
  shiftsByPosition: Record<string, number>;
}> => {
  let url = `/shifts/stats/location/${locationId}`;
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }

  const response = await fetchWithAuth<{
    totalShifts: number;
    uniqueEmployees: number;
    uniquePositions: number;
    shiftsByDay: Record<string, number>;
    shiftsByPosition: Record<string, number>;
  }>(
    url,
    { 
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    },
    token
  );
  return response.data!;
};

// Additional helper functions
export const assignEmployeeToShift = async (
  shiftId: number,
  employeeId: number,
  token: string
): Promise<EmployeeShift> => {
  const response = await fetchWithAuth<EmployeeShift>(
    `/shifts/${shiftId}/employees`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ employee_id: employeeId }),
    },
    token
  );
  return response.data!;
};

export const removeEmployeeFromShift = async (
  shiftId: number,
  employeeId: number,
  token: string
): Promise<void> => {
  await fetchWithAuth(
    `/shifts/${shiftId}/employees/${employeeId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    },
    token
  );
};

// Update your api export
export const apiCall = {
  auth: {
    login,
    logout,
    getCurrentUser,
    refreshToken,
  }, 
   employees: {
    fetchAll: fetchEmployees,
    create: createEmployee,
    update: updateEmployee,
    delete: deleteEmployee,
  },
   clientApi: {
  fetchAll: fetchClients,
  getById: getClientById,
  create: createClient,
  update: updateClient,
  delete: deleteClient,
  locations: {
    add: addClientLocation,
    update: updateClientLocation,
    remove: removeClientLocation,
  },
},
   shifts: {
    fetchAll: fetchShifts,
    getById: getShiftById,
    create: createShift,
    update: updateShift,
    delete: deleteShift,
    createRecurring: createRecurringShifts,
    getLocationStats: getLocationShiftStats,
    removeEmployeeFromShift,
    assignEmployeeToShift
  },
};
