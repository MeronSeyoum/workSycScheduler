// src/services/shiftService.ts
import { fetchWithAuth } from './apiBase';
import {
  CreateShiftWithEmployeesDto,
  
  ShiftWithEmployees,
  UpdateShiftDto,
  // RecurringShiftDto,


} from "@/lib/types/shift";


export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  warnings?: string[];
}

// Helper function to transform backend response to ShiftWithEmployees




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

//   // Transform the backend response to match ShiftWithEmployees type
//   return transformShiftResponse(response.data);
// };
export interface CreateShiftResult {
  shift: ShiftWithEmployees;
  warnings?: string[];
}

export const createShift = async (
  shiftData: CreateShiftWithEmployeesDto, 
  token: string
): Promise<CreateShiftResult> => {
  const payload = {
    client_id: Number(shiftData.client_id),
    date: shiftData.date,
    start_time: shiftData.start_time,
    end_time: shiftData.end_time,
    shift_type: shiftData.shift_type || 'regular',
    employee_ids: shiftData.employee_ids,
    notes: shiftData.notes
  };

  const response = await fetchWithAuth<ShiftWithEmployees>(
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
  
  return {
    shift: response.data,
    warnings: response.warnings
  };
};


// Add this utility type if you don't have it


// Remove the transformShiftResponse function since it's no longer needed
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