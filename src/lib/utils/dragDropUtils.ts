// dragDropUtils.ts - Utilities for managing drag and drop operations

import { ShiftWithEmployees } from "@/lib/types/shift";
import { Employee } from "@/lib/types/employee";

export const ItemTypes = {
  SHIFT: "shift",
  UNASSIGNED_SHIFT: "unassigned_shift",
  DRAFT_SHIFT: "draft_shift",
} as const;

export type ItemType = typeof ItemTypes[keyof typeof ItemTypes];

export interface DragItem {
  type: ItemType;
  shift: ShiftWithEmployees;
  sourceEmployeeId?: number;
  sourceDate?: string;
  originalColumn?: string;
}

export interface DropResult {
  targetType: 'empty_cell' | 'shift_card' | 'unassigned_zone';
  employeeId?: number;
  date?: string;
  targetShift?: ShiftWithEmployees;
  dropped: boolean;
}

/**
 * Determines the correct drag item type based on shift properties
 */
export const getShiftDragType = (shift: ShiftWithEmployees): ItemType => {
  if (shift.status === "draft") return ItemTypes.DRAFT_SHIFT;
  if (shift.employees.length === 0) return ItemTypes.UNASSIGNED_SHIFT;
  return ItemTypes.SHIFT;
};

/**
 * Generates a unique column identifier for a shift's current position
 */

export const getShiftColumnId = (shift: ShiftWithEmployees, employeeId?: number, date?: string): string => {
  if (employeeId && date) {
    return `${employeeId}-${date}`;
  }
  
  if (shift.employees.length > 0) {
    const employee = shift.employees[0].employee;
    return employee ? `${employee.id}-${shift.date}` : `unknown-${shift.date}`;
  }
  
  return `unassigned-${shift.date}`;
};


export const trackDragOperation = (
  operation: 'move' | 'swap' | 'unassign',
  sourceColumn: string,
  targetColumn: string,
  shiftId: number
) => {
  console.log(`Drag ${operation}: Shift ${shiftId} from ${sourceColumn} to ${targetColumn}`);
};

export const validateDragOperation = (
  sourceColumn: string,
  targetColumn: string
): boolean => {
  return sourceColumn !== targetColumn;
}
/**
 * Creates a drag item from a shift
 */
export const createDragItem = (shift: ShiftWithEmployees, employeeId?: number, date?: string): DragItem => {
  const sourceEmployeeId = shift.employees.length > 0 ? shift.employees[0].employee?.id : undefined;
  const originalColumn = getShiftColumnId(shift, employeeId, date);
  
  return {
    type: getShiftDragType(shift),
    shift,
    sourceEmployeeId,
    sourceDate: shift.date,
    originalColumn,
  };
};;

/**
 * Validates if a drop operation is allowed
 */
export const canDropShift = (
  dragItem: DragItem, 
  targetEmployeeId?: number, 
  targetDate?: string,
  targetShift?: ShiftWithEmployees
): boolean => {
  const targetColumn = targetEmployeeId && targetDate ? `${targetEmployeeId}-${targetDate}` : null;
  
  // Can't drop on the same position
  if (dragItem.originalColumn === targetColumn) {
    return false;
  }
  
  // Can't drop on self when swapping
  if (targetShift && dragItem.shift.id === targetShift.id) {
    return false;
  }
  
  return true;
};

/**
 * Validates if a shift can be moved to unassigned
 */
export const canMoveToUnassigned = (dragItem: DragItem): boolean => {
  // Only assigned shifts can be moved to unassigned
  return dragItem.shift.employees.length > 0;
};

/**
 * Determines if two shifts can be swapped
 */
export const canSwapShifts = (shift1: ShiftWithEmployees, shift2: ShiftWithEmployees): boolean => {
  // Can't swap with self
  if (shift1.id === shift2.id) return false;
  
  // Both shifts should have employees for a proper swap
  if (shift1.employees.length === 0 || shift2.employees.length === 0) return false;
  
  // Check if shifts are on different dates or assigned to different employees
  const emp1 = shift1.employees[0]?.employee;
  const emp2 = shift2.employees[0]?.employee;
  
  return shift1.date !== shift2.date || emp1?.id !== emp2?.id;
};

/**
 * Creates a preview of what will happen during a drop operation
 */
export const getDropPreview = (
  dragItem: DragItem,
  targetEmployeeId?: number,
  targetDate?: string,
  targetShift?: ShiftWithEmployees,
  employees?: Employee[]
): { 
  isValid: boolean; 
  message: string; 
  operation: 'move' | 'swap' | 'unassign' | 'invalid' 
} => {
  if (targetShift) {
    // Swap operation
    if (canSwapShifts(dragItem.shift, targetShift)) {
      const sourceEmp = dragItem.shift.employees[0]?.employee;
      const targetEmp = targetShift.employees[0]?.employee;
      
      return {
        isValid: true,
        message: `Swap ${sourceEmp?.user?.first_name || 'Unknown'}'s shift with ${targetEmp?.user?.first_name || 'Unknown'}'s shift`,
        operation: 'swap'
      };
    } else {
      return {
        isValid: false,
        message: "Cannot swap these shifts",
        operation: 'invalid'
      };
    }
  }
  
  if (targetEmployeeId && targetDate) {
    // Move to employee operation
    if (canDropShift(dragItem, targetEmployeeId, targetDate)) {
      const targetEmployee = employees?.find(e => e.id === targetEmployeeId);
      const employeeName = targetEmployee ? 
        `${targetEmployee.first_name} ${targetEmployee.last_name}`.trim() : 
        'Unknown Employee';
        
      return {
        isValid: true,
        message: `Assign shift to ${employeeName}`,
        operation: 'move'
      };
    } else {
      return {
        isValid: false,
        message: "Cannot move shift to this position",
        operation: 'invalid'
      };
    }
  }
  
  // Move to unassigned operation
  if (canMoveToUnassigned(dragItem)) {
    return {
      isValid: true,
      message: "Convert to unassigned shift",
      operation: 'unassign'
    };
  }
  
  return {
    isValid: false,
    message: "Invalid drop operation",
    operation: 'invalid'
  };
};

/**
 * Calculates time conflicts between shifts
 */
export const hasTimeConflict = (shift1: ShiftWithEmployees, shift2: ShiftWithEmployees): boolean => {
  if (shift1.date !== shift2.date) return false;
  
  const start1 = new Date(`2000-01-01T${shift1.start_time}`);
  const end1 = new Date(`2000-01-01T${shift1.end_time}`);
  const start2 = new Date(`2000-01-01T${shift2.start_time}`);
  const end2 = new Date(`2000-01-01T${shift2.end_time}`);
  
  return start1 < end2 && start2 < end1;
};

/**
 * Groups shifts by employee and date for efficient lookups
 */
export const groupShiftsByEmployeeAndDate = (shifts: ShiftWithEmployees[]): Map<string, ShiftWithEmployees[]> => {
  const grouped = new Map<string, ShiftWithEmployees[]>();
  
  shifts.forEach(shift => {
    shift.employees?.forEach(empShift => {
      if (empShift.employee) {
        const key = `${empShift.employee.id}-${shift.date}`;
        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(shift);
      }
    });
  });
  
  return grouped;
};

/**
 * Groups shifts by date for unassigned shifts
 */
export const groupShiftsByDate = (shifts: ShiftWithEmployees[]): Map<string, ShiftWithEmployees[]> => {
  const grouped = new Map<string, ShiftWithEmployees[]>();
  
  shifts.forEach(shift => {
    if (!grouped.has(shift.date)) {
      grouped.set(shift.date, []);
    }
    grouped.get(shift.date)!.push(shift);
  });
  
  return grouped;
};

/**
 * Debounces rapid drag operations to prevent excessive API calls
 */
export const createDragDebouncer = (delay: number = 100) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return <T extends any[]>(fn: (...args: T) => void) => {
    return (...args: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        fn(...args);
        timeoutId = null;
      }, delay);
    };
  };
};

/**
 * Optimistic update helper for immediate UI feedback
 */
export const createOptimisticUpdater = <T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  rollbackTimeout: number = 5000
) => {
  return (
    optimisticUpdate: (prev: T) => T,
    asyncOperation: () => Promise<void>,
    rollbackUpdate?: (prev: T) => T
  ) => {
    let hasRolledBack = false;
    
    // Apply optimistic update immediately
    setState(optimisticUpdate);
    
    // Set up rollback timer
    const rollbackTimer = setTimeout(() => {
      if (!hasRolledBack && rollbackUpdate) {
        setState(rollbackUpdate);
        hasRolledBack = true;
        console.warn("Operation timed out, rolling back optimistic update");
      }
    }, rollbackTimeout);
    
    // Execute async operation
    return asyncOperation()
      .then(() => {
        clearTimeout(rollbackTimer);
      })
      .catch((error) => {
        clearTimeout(rollbackTimer);
        if (!hasRolledBack && rollbackUpdate) {
          setState(rollbackUpdate);
        }
        throw error;
      });
  };
};