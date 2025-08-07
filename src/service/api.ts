// src/services/api.ts
import * as authService from './authService';
import * as userService from './userService';
import * as employeeService from './employeeService';
import * as clientService from './clientService';
import * as shiftService from './shiftService';
import * as qrCodeService from './qrCodeService';
import * as dashboardService from './dashboardService';
import * as attendanceService from './attendanceService';

export const api = {
  auth: authService,
  user: userService,
  employees: employeeService,
  clients: clientService,
  shifts: shiftService,
  qrCodes: qrCodeService,
  dashboardService,
  attendanceService
};