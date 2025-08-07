import {  ClockInOutLog, Location } from '@/types/shift';
import { Employee } from '@/types/employee';

// Sample Locations Data
export const mockLocations: Location[] = [
  { 
    id: 'loc-1', 
    name: 'Downtown Office', 
    address: '123 Main St, Anytown', 
    coordinates: { lat: 37.7749, lng: -122.4194 } 
  },
  { 
    id: 'loc-2', 
    name: 'Westside Mall', 
    address: '456 Commerce Blvd, Anytown',
    coordinates: { lat: 37.7812, lng: -122.4321 } 
  },
  { 
    id: 'loc-3', 
    name: 'Eastside Apartments', 
    address: '789 Residential Rd, Anytown',
    coordinates: { lat: 37.7689, lng: -122.4023 } 
  },
  { 
    id: 'loc-4', 
    name: 'Northside Hospital', 
    address: '321 Health Ave, Anytown',
    coordinates: { lat: 37.7825, lng: -122.3887 } 
  },
];

// Sample Employees Data
export const mockEmployees: Employee[] = [
  { 
    id: '1', 
    name: 'Alex Johnson', 
    department: 'Commercial', 
    roles: 'Team Lead',
    locations: ['loc-1', 'loc-2'] 
  },
  { 
    id: '2', 
    name: 'Maria Garcia', 
    department: 'Residential', 
    roles: 'Cleaner',
    locations: ['loc-3'] 
  },
  { 
    id: '3', 
    name: 'James Wilson', 
    department: 'Commercial', 
    roles: 'Cleaner',
    locations: ['loc-1', 'loc-4'] 
  },
  { 
    id: '4', 
    name: 'Sarah Chen', 
    department: 'Residential', 
    roles: 'Supervisor',
    locations: ['loc-2', 'loc-3'] 
  },
  { 
    id: '5', 
    name: 'David Kim', 
    department: 'Commercial', 
    roles: 'Cleaner',
    locations: ['loc-4'] 
  },
];

// Generate realistic time logs for the past 30 days
export const mockTimeLogs: ClockInOutLog[] = [];

mockEmployees.forEach(employee => {
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const logDate = new Date();
    logDate.setDate(logDate.getDate() - daysAgo);
    
    // Skip weekends randomly (20% chance)
    if (logDate.getDay() % 6 === 0 && Math.random() > 0.2) continue;

    // Get a random location from the employee's assigned locations
    const locationId = employee.locations[Math.floor(Math.random() * employee.locations.length)];
    const location = mockLocations.find(loc => loc.id === locationId);

    // Clock-In between 8-9:30 AM
    const clockIn = new Date(logDate);
    clockIn.setHours(8, Math.floor(Math.random() * 90), 0);

    // 10% chance of missing clock-out (active status)
    const hasClockOut = Math.random() > 0.1;
    
    // Clock-Out between 4-7 PM if exists
    const clockOut = hasClockOut ? new Date(clockIn) : null;
    if (clockOut) {
      clockOut.setHours(16 + Math.floor(Math.random() * 3));
      clockOut.setMinutes(Math.floor(Math.random() * 60));
    }

    // Calculate duration in minutes
    const duration = clockOut 
      ? Math.round((clockOut.getTime() - clockIn.getTime()) / 60000)
      : undefined;

    mockTimeLogs.push({
      id: `log-${employee.id}-${daysAgo}`,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeDepartment: employee.department,
      clockIn: clockIn.toISOString(),
      clockOut: clockOut?.toISOString() || null,
      duration,
      status: clockOut ? 'inactive' : 'active',
      location: location ? {
        id: location.id,
        name: location.name,
        lat: location.coordinates.lat + (Math.random() * 0.002 - 0.001), // Small random offset
        lng: location.coordinates.lng + (Math.random() * 0.002 - 0.001)  // Small random offset
      } : null
    });
  }
});

// Mock API Functions
export const fetchTimeLogs = async (
  page: number = 1,
  pageSize: number = 10,
  employeeId?: string,
  locationId?: string,
  date?: string,
  status?: 'active' | 'inactive',
  search?: string
): Promise<{ logs: ClockInOutLog[]; totalItems: number; totalPages: number }> => {
  // Filter logic
  let filteredLogs = [...mockTimeLogs];
  
  if (employeeId) {
    filteredLogs = filteredLogs.filter(log => log.employeeId === employeeId);
  }
  
  if (locationId) {
    filteredLogs = filteredLogs.filter(log => log.location?.id === locationId);
  }
  
  if (date) {
    const filterDate = new Date(date).toDateString();
    filteredLogs = filteredLogs.filter(log => 
      new Date(log.clockIn).toDateString() === filterDate
    );
  }
  
  if (status) {
    filteredLogs = filteredLogs.filter(log => log.status === status);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredLogs = filteredLogs.filter(log => 
      log.employeeName.toLowerCase().includes(searchLower) ||
      (log.location?.name.toLowerCase().includes(searchLower)) ||
      log.employeeDepartment.toLowerCase().includes(searchLower)
    );
  }

  // Sort by most recent first
  filteredLogs.sort((a, b) => 
    new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()
  );

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);
  
  return {
    logs: paginatedLogs,
    totalItems: filteredLogs.length,
    totalPages: Math.ceil(filteredLogs.length / pageSize)
  };
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockEmployees;
};

export const fetchLocations = async (): Promise<Location[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockLocations;
};


// Mock Attendance Stats Data
export const fetchAttendanceStats = async (): Promise<AttendanceStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Calculate some stats from the mockTimeLogs
  const today = new Date().toDateString();
  const todayLogs = mockTimeLogs.filter(log => 
    new Date(log.clockIn).toDateString() === today
  );

  const presentCount = todayLogs.filter(log => log.clockOut !== null).length;
  const absentCount = mockEmployees.length - presentCount;

  return {
    present: {
      onTime: 265, // From your screenshot
      late: 62,    // From your screenshot
      early: 224    // From your screenshot
    },
    absent: {
      absent: 42,     // From your screenshot
      noClockIn: 36,  // From your screenshot
      noClockOut: 0,  // From your screenshot
      invalid: 0,     // From your screenshot
      dayOff: 0,      // From your screenshot
      timeOff: 0      // From your screenshot
    },
    trends: {
      onTime: "+12 vs yesterday",  // From your screenshot
      late: "-6 vs yesterday",     // From your screenshot
      early: "-6 vs yesterday",    // From your screenshot
      absent: "+12 vs yesterday",  // From your screenshot
      noClockIn: "-6 vs yesterday" // From your screenshot
    }
  };
};