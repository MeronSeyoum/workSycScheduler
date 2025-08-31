// src/services/shiftService.ts
import { fetchWithAuth } from './apiBase';
import {
  CreateShiftWithEmployeesDto,
  EmployeeShift,
  Shift,
  ShiftWithEmployees,
  UpdateShiftDto,
  // RecurringShiftDto,
  ShiftStatus
} from "@/lib/types/shift";

// Helper function to transform backend response to ShiftWithEmployees
const transformShiftResponse = (responseData: {
  shift: Shift;
  employeeShifts: (EmployeeShift & {
    employee?: {
      id: number;
      position: string;
      employee_code: string;
      hire_date: string;
      user?: {
        first_name: string;
        last_name: string;
        email: string;
      };
    };
    assigned_by_user?: {
      id: number;
      first_name: string;
      last_name: string;
    };
  })[];
  warnings?: string[];
}): ShiftWithEmployees => {
  // Transform employee shifts to the expected format
  const employees = responseData.employeeShifts.map(es => ({
    assignment_id: es.id,
    status: es.status as ShiftStatus,
    notes: es.notes || null,
    assigned_by: es.assigned_by_user ? {
      id: es.assigned_by_user.id,
      first_name: es.assigned_by_user.first_name,
      last_name: es.assigned_by_user.last_name
    } : {
      id: es.assigned_by || 0,
      first_name: 'Unknown',
      last_name: 'User'
    },
    employee: {
      id: es.employee?.id || es.employee_id,
      position: es.employee?.position || 'Unknown',
      employee_code: es.employee?.employee_code || 'N/A',
      hire_date: es.employee?.hire_date || new Date().toISOString(),
      user: {
        first_name: es.employee?.user?.first_name || 'Unknown',
        last_name: es.employee?.user?.last_name || 'Employee',
        email: es.employee?.user?.email || 'unknown@example.com'
      }
    }
  }));

  return {
    ...responseData.shift,
    client: {
      id: 0, // This will need to be populated from the shift data or another source
      business_name: 'Unknown Client',
      email: 'unknown@example.com',
      phone: '000-000-0000',
      contact_person: 'Unknown Contact',
      location_address: {
        city: 'Unknown',
        state: 'Unknown',
        street: 'Unknown Street',
        country: 'Unknown',
        postal_code: '00000'
      },
      status: 'active',
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    employee_shifts: responseData.employeeShifts.map(es => ({
      id: es.id,
      employee_id: es.employee_id,
      shift_id: es.shift_id,
      assigned_by: es.assigned_by || 0,
      status: es.status as ShiftStatus,
      notes: es.notes || null
    })),
    employees: employees,
    // warnings: responseData.warnings
  };
};

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
      },
      token
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
): Promise<ShiftWithEmployees> => {
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
  }

  // Transform the backend response to match ShiftWithEmployees type
  return transformShiftResponse(response.data);
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

// export const createRecurringShifts = async (
//   recurringData: RecurringShiftDto,
//   token: string
// ): Promise<{ shifts: Shift[]; employeeShifts: EmployeeShift[] }> => {
//   const response = await fetchWithAuth<{
//     shifts: Shift[];
//     employeeShifts: EmployeeShift[];
//     warnings?: string[];
//   }>(
//     '/shifts/recurring',
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({
//         ...recurringData,
//         employee_ids: recurringData.employee_ids.map(id => Number(id)),
//         client_id: Number(recurringData.client_id)
//       }),
//     },
//     token
//   );

//   if (!response.data) {
//     throw new Error(response.message || 'Failed to create recurring shifts');
//   }

//   // Handle partial success with warnings
//   if (response.data.warnings && response.data.warnings.length > 0) {
//     console.warn('Recurring shifts created with warnings:', response.data.warnings);
//   }

//   return {
//     shifts: response.data.shifts,
//     employeeShifts: response.data.employeeShifts
//   };
// };

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

export const moveShiftToDate = async (
  shiftId: number,
  newDate: string,
  employeeId: number,
  token: string
): Promise<{ oldShiftId: number; newShift: ShiftWithEmployees }> => {
  const response = await fetchWithAuth<{
    oldShiftId: number;
    newShift: ShiftWithEmployees;
  }>(
    '/shifts/move',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ shiftId, newDate, employeeId })
    },
    token
  );

  if (!response.data) {
    throw new Error('Failed to move shift');
  }

  return response.data;
};


// // src/services/shiftService.ts
// import { fetchWithAuth } from './apiBase';
// import {
//   CreateShiftWithEmployeesDto,
//   EmployeeShift,
//   Shift,
//   ShiftWithEmployees,
//   UpdateShiftDto,
//   // RecurringShiftDto
// } from "@/lib/types/shift";

// export const fetchShifts = async (
//   params: {
//     clientId?: number;
//     employeeId?: number;
//     startDate?: string;
//     endDate?: string;
//     status?: 'scheduled' | 'completed' | 'missed';
//   },
//   token: string
// ): Promise<ShiftWithEmployees[]> => {
//   const query = new URLSearchParams();
  
//   if (params.clientId) query.append('clientId', params.clientId.toString());
//   if (params.employeeId) query.append('employeeId', params.employeeId.toString());
//   if (params.startDate) query.append('startDate', params.startDate);
//   if (params.endDate) query.append('endDate', params.endDate);
//   if (params.status) query.append('status', params.status);

//   try {
//     const response = await fetchWithAuth<ShiftWithEmployees[]>(
//       `/shifts?${query.toString()}`,
//       { 
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
    
//     if (!response.data) {
//       throw new Error('Failed to fetch shifts');
//     }

//     return response.data || [];
//   } catch (error) {
//     console.error('Error fetching shifts:', error);
//     throw error;
//   }
// };

// export const getShiftById = async (
//   id: number,
//   token: string
// ): Promise<ShiftWithEmployees> => {
//   const response = await fetchWithAuth<ShiftWithEmployees>(
//     `/shifts/${id}`,
//     { method: 'GET' },
//     token
//   );
//   return response.data!;
// };

// export const createShift = async (
//   shiftData: CreateShiftWithEmployeesDto, 
//   token: string
// ): Promise<ShiftWithEmployees> => {
//   const payload = {
//     client_id: Number(shiftData.client_id),
//     date: shiftData.date,
//     start_time: shiftData.start_time,
//     end_time: shiftData.end_time,
//     shift_type: shiftData.shift_type || 'regular',
//     employee_ids: shiftData.employee_ids.map(id => Number(id)),
//     notes: shiftData.notes || undefined
//   };

//   const response = await fetchWithAuth<{
//     shift: Shift;
//     employeeShifts: EmployeeShift[];
//     warnings?: string[];
//   }>(
//     '/shifts',
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(payload)
//     },
//     token
//   );

//   if (!response.data) {
//     throw new Error(response.message || 'Failed to create shift');
//   }

//   // Handle partial success with warnings
//   if (response.data.warnings && response.data.warnings.length > 0) {
//     console.warn('Shift created with warnings:', response.data.warnings);
//   }

//   return response.data ;
// };

// export const updateShift = async (
//   id: number,
//   shiftData: UpdateShiftDto,
//   token: string
// ): Promise<ShiftWithEmployees> => {
//   const response = await fetchWithAuth<ShiftWithEmployees>(
//     `/shifts/${id}`,
//     {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify(shiftData),
//     },
//     token
//   );
//   return response.data!;
// };

// export const deleteShift = async (
//   id: number,
//   token: string
// ): Promise<void> => {
//   await fetchWithAuth(
//     `/shifts/${id}`,
//     {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     },
//     token
//   );
// };

// // export const createRecurringShifts = async (
// //   recurringData: RecurringShiftDto,
// //   token: string
// // ): Promise<{ shifts: Shift[]; employeeShifts: EmployeeShift[] }> => {
// //   const response = await fetchWithAuth<{
// //     shifts: Shift[];
// //     employeeShifts: EmployeeShift[];
// //     warnings?: string[];
// //   }>(
// //     '/shifts/recurring',
// //     {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'Authorization': `Bearer ${token}`
// //       },
// //       body: JSON.stringify({
// //         ...recurringData,
// //         employee_ids: recurringData.employee_ids.map(id => Number(id)),
// //         client_id: Number(recurringData.client_id)
// //       }),
// //     },
// //     token
// //   );

// //   if (!response.data) {
// //     throw new Error(response.message || 'Failed to create recurring shifts');
// //   }

// //   // Handle partial success with warnings
// //   if (response.data.warnings && response.data.warnings.length > 0) {
// //     console.warn('Recurring shifts created with warnings:', response.data.warnings);
// //   }

// //   return {
// //     shifts: response.data.shifts,
// //     employeeShifts: response.data.employeeShifts
// //   };
// // };

// export const getLocationShiftStats = async (
//   locationId: number,
//   startDate?: string,
//   endDate?: string,
//   token?: string
// ): Promise<{
//   totalShifts: number;
//   uniqueEmployees: number;
//   uniquePositions: number;
//   shiftsByDay: Record<string, number>;
//   shiftsByPosition: Record<string, number>;
// }> => {
//   let url = `/shifts/stats/location/${locationId}`;
//   if (startDate && endDate) {
//     url += `?startDate=${startDate}&endDate=${endDate}`;
//   }

//   const response = await fetchWithAuth<{
//     totalShifts: number;
//     uniqueEmployees: number;
//     uniquePositions: number;
//     shiftsByDay: Record<string, number>;
//     shiftsByPosition: Record<string, number>;
//   }>(
//     url,
//     { 
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${token}`
//       }
//     },
//     token
//   );
//   return response.data!;
// };


// export const moveShiftToDate = async (
//   shiftId: number,
//   newDate: string,
//   employeeId: number,
//   token: string
// ): Promise<{ oldShiftId: number; newShift: ShiftWithEmployees }> => { // Change return type
//   const response = await fetchWithAuth(
//     '/shifts/move',
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       },
//       body: JSON.stringify({ shiftId, newDate, employeeId })
//     },
//     token
//   );

//   if (!response) {
//     throw new Error('Failed to move shift');
//   }

//   const data = await response;
//   return data.data;
// };

// // export const assignEmployeeToShift = async (
// //   shiftId: number,
// //   employeeId: number,
// //   token: string
// // ): Promise<EmployeeShift> => {
// //   const response = await fetchWithAuth<EmployeeShift>(
// //     `/shifts/${shiftId}/employees`,
// //     {
// //       method: 'POST',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'Authorization': `Bearer ${token}`
// //       },
// //       body: JSON.stringify({ employee_id: employeeId }),
// //     },
// //     token
// //   );
// //   return response.data!;
// // };

// // export const removeEmployeeFromShift = async (
// //   shiftId: number,
// //   employeeId: number,
// //   token: string
// // ): Promise<void> => {
// //   await fetchWithAuth(
// //     `/shifts/${shiftId}/employees/${employeeId}`,
// //     {
// //       method: 'DELETE',
// //       headers: {
// //         'Authorization': `Bearer ${token}`
// //       }
// //     },
// //     token
// //   );
// // };