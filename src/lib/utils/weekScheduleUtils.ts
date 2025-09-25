import dayjs, { Dayjs } from "dayjs";
import { Employee } from "../types/employee";
import { ScheduleTemplate, WeekScheduleData } from "../types/schedule";
import { CreateShiftWithEmployeesDto, ShiftWithEmployees } from "../types/shift";

// Utility functions for week operations
export const weekScheduleUtils = {
  /**
   * Extract week schedule data from current shifts
   */
  extractWeekSchedule: (
    shifts: ShiftWithEmployees[],
    draftShifts: ShiftWithEmployees[],
    unassignedShifts: ShiftWithEmployees[],
    weekStart: Dayjs,
    locationId: string,
    locationName: string
  ): WeekScheduleData => {
    const weekEnd = weekStart.endOf('isoWeek');
    
    // Combine all shift types for the week
    const allShifts = [...shifts, ...draftShifts, ...unassignedShifts];
    
    // Filter shifts for the specific week
    const weekShifts = allShifts.filter(shift => {
      const shiftDate = dayjs(shift.date);
      return shiftDate.isBetween(weekStart, weekEnd, 'day', '[]');
    });

    // Calculate metadata
    const totalHours = weekShifts.reduce((sum, shift) => {
      const start = dayjs(shift.start_time, 'HH:mm');
      const end = dayjs(shift.end_time, 'HH:mm');
      return sum + end.diff(start, 'hours', true);
    }, 0);

    const uniqueEmployees = new Set(
      weekShifts
        .filter(shift => shift.employees.length > 0)
        .flatMap(shift => shift.employees.map(emp => emp.employee.id))
    );

    return {
      weekStart: weekStart.format('YYYY-MM-DD'),
      weekEnd: weekEnd.format('YYYY-MM-DD'),
      shifts: weekShifts,
      metadata: {
        totalShifts: weekShifts.length,
        totalHours: Math.round(totalHours * 10) / 10,
        employeeCount: uniqueEmployees.size,
        locationId,
        locationName,
        createdAt: dayjs().toISOString(),
      }
    };
  },

  /**
   * Transform shifts to target week dates preserving employee assignments
   */
  transformShiftsToTargetWeek: (
    sourceShifts: ShiftWithEmployees[],
    sourceWeekStart: Dayjs,
    targetWeekStart: Dayjs
  ): Array<Omit<CreateShiftWithEmployeesDto, 'client_id'> & { 
    originalShift: ShiftWithEmployees;
    isUnassigned: boolean;
  }> => {
    const daysDiff = targetWeekStart.diff(sourceWeekStart, 'days');

    return sourceShifts.map(shift => {
      const originalDate = dayjs(shift.date);
      const newDate = originalDate.add(daysDiff, 'days');
      const isUnassigned = shift.employees.length === 0;

      return {
        originalShift: shift,
        isUnassigned,
        date: newDate.format('YYYY-MM-DD'),
        start_time: shift.start_time,
        end_time: shift.end_time,
        employee_ids: isUnassigned ? [] : shift.employees.map(emp => emp.employee.id),
        shift_type: shift.shift_type || 'regular',
        notes: shift.notes,
        name: shift.name, // For unassigned shifts
      };
    });
  },

  /**
   * Validate week copy operation
   */
  validateWeekCopy: (
    sourceWeek: WeekScheduleData,
    targetWeekStart: Dayjs,
    employees: Employee[]
  ): { isValid: boolean; warnings: string[]; errors: string[] } => {
    const warnings: string[] = [];
    const errors: string[] = [];
    const employeeIds = new Set(employees.map(emp => emp.id));

    // Check if employees from source week still exist
    const assignedShifts = sourceWeek.shifts.filter(s => s.employees.length > 0);
    const sourceEmployeeIds = new Set(
      assignedShifts.flatMap(shift => 
        shift.employees.map(emp => emp.employee.id)
      )
    );

    const missingEmployees: string[] = [];
    sourceEmployeeIds.forEach(empId => {
      if (!employeeIds.has(empId)) {
        const shift = assignedShifts.find(s => 
          s.employees.some(e => e.employee.id === empId)
        );
        const empName = shift?.employees.find(e => e.employee.id === empId)
          ?.employee.user 
          ? `${shift.employees.find(e => e.employee.id === empId)?.employee.user.first_name} ${shift.employees.find(e => e.employee.id === empId)?.employee.user.last_name}`
          : `Employee ID ${empId}`;
        missingEmployees.push(empName);
      }
    });

    if (missingEmployees.length > 0) {
      errors.push(`The following employees are no longer available: ${missingEmployees.join(', ')}`);
    }

    // Check for potential conflicts with existing shifts
    const targetWeekEnd = targetWeekStart.endOf('isoWeek');
    const isWeekend = targetWeekStart.day() === 0 || targetWeekEnd.day() === 6;
    
    if (isWeekend) {
      warnings.push('Target week includes weekend dates');
    }

    // Check if target week is in the past
    if (targetWeekStart.isBefore(dayjs().startOf('day'))) {
      warnings.push('Target week is in the past');
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  },

  /**
   * Format time range for display
   */
  formatTimeRange: (startTime: string, endTime: string): string => {
    const start = dayjs(startTime, 'HH:mm').format('h:mm A');
    const end = dayjs(endTime, 'HH:mm').format('h:mm A');
    return `${start} - ${end}`;
  },

  /**
   * Calculate week display text
   */
  formatWeekRange: (weekStart: string): string => {
    const start = dayjs(weekStart);
    const end = start.endOf('isoWeek');
    
    if (start.month() === end.month()) {
      return `${start.format('MMM D')} - ${end.format('D, YYYY')}`;
    }
    return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
  }
};

// Storage utilities (for localStorage - replace with API calls when ready)
export const templateStorage = {
  saveTemplate: (template: ScheduleTemplate): void => {
    const templates = templateStorage.getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = { ...template, updatedAt: dayjs().toISOString() };
    } else {
      templates.push(template);
    }
    
    localStorage.setItem('scheduleTemplates', JSON.stringify(templates));
  },

  getTemplates: (): ScheduleTemplate[] => {
    try {
      const stored = localStorage.getItem('scheduleTemplates');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load templates:', error);
      return [];
    }
  },

  deleteTemplate: (templateId: string): void => {
    const templates = templateStorage.getTemplates().filter(t => t.id !== templateId);
    localStorage.setItem('scheduleTemplates', JSON.stringify(templates));
  }
};