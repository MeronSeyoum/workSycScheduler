// SchedulerPage.tsx - Complete Redesign
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Alert, Spin, notification, Layout } from "antd";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";

// Import custom components
import { AISchedulerModal } from "@/components/ui/shift/AISchedulerModal";
import { OpenShiftsModal } from "@/components/ui/shift/OpenShiftsModal";
import { ShiftSwapsModal } from "@/components/ui/shift/ShiftSwapsModal";
import { ComplianceWarnings } from "@/components/ui/shift/ComplianceWarnings";
import { ScheduleGrid } from "@/components/ui/shift/ScheduleGrid";
import { EditShiftTimeModal } from "@/components/ui/shift/EditShiftTimeModal";
import { DashboardStats } from "@/components/ui/shift/DashboardStats";
import { ScheduleHeaderWithFilters } from "@/components/ui/shift/ScheduleHeaderWithFilters";
import { BulkShiftCreator } from "@/components/ui/shift/BulkShiftCreator";
import { BulkShiftApproval } from "@/components/ui/shift/BulkShiftApproval";

// Import types
import { Client } from "@/lib/types/client";
import { Employee } from "@/lib/types/employee";
import { useAuth } from "../../components/providers/AuthProvider";
import { api as apiCall } from "@/lib/api";
import {
  ShiftWithEmployees,
  CreateShiftWithEmployeesDto,
  UpdateShiftDto,
} from "@/lib/types/shift";
import { Skeleton } from "@/components/ui/common/skeleton";
import { BulkShiftTemplate, BulkShiftCreationDto } from "@/lib/types/shift";

// Day.js extensions
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);

// Constants and interfaces
interface ShiftTimeConfig {
  start: string;
  end: string;
  minStart?: string;
  maxEnd?: string;
  allowedDurations?: number[]; // in hours
}

const DEFAULT_SHIFT_CONFIG: ShiftTimeConfig = {
  start: "08:00",
  end: "16:00",
  minStart: "06:00",
  maxEnd: "22:00",
  allowedDurations: [4, 6, 8, 10, 12],
};

const DEFAULT_SHIFT_TIME = { 
  start: DEFAULT_SHIFT_CONFIG.start, 
  end: DEFAULT_SHIFT_CONFIG.end 
};

const SHIFT_TIME_OPTIONS = [
  { label: "4 hours", value: { start: "08:00", end: "12:00" } },
  { label: "6 hours", value: { start: "08:00", end: "14:00" } },
  { label: "8 hours", value: { start: "08:00", end: "16:00" } },
  { label: "10 hours", value: { start: "08:00", end: "18:00" } },
  { label: "12 hours", value: { start: "08:00", end: "20:00" } },
];

interface LocationData {
  id: string;
  name: string;
}

interface LoadingState {
  shifts: boolean;
  employees: boolean;
  clients: boolean;
  general: boolean;
  aiScheduling: boolean;
}

interface OpenShift {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  position: string;
  location: string;
  required_skills: string[];
}

interface ShiftSwapRequest {
  id: number;
  shift_id: number;
  requester_id: number;
  requested_employee_id: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
  created_at: string;
}

interface ComponentState {
  shifts: ShiftWithEmployees[];
  employees: Employee[];
  clients: Client[];
  selectedLocation: LocationData | null;
  dateRange: [Dayjs, Dayjs];
  view: "day" | "week" | "month";
  searchTerm: string;
  departmentFilter: string;
  isTimePickerModalOpen: boolean;
  shiftToEdit: ShiftWithEmployees | null;
  newTime: { start: string; end: string };
  error: string | null;
  loading: LoadingState;
  openShifts: OpenShift[];
  shiftSwapRequests: ShiftSwapRequest[];
  isAISchedulerModalOpen: boolean;
  isOpenShiftsModalOpen: boolean;
  isShiftSwapsModalOpen: boolean;
  complianceWarnings: string[];
  sidebarCollapsed: boolean;
  selectedNavKey: string;
  showStatsDashboard: boolean;
  selectedShiftTime: { start: string; end: string };
  showShiftTimeSelector: boolean;
  bulkTemplates: BulkShiftTemplate[];
  isBulkCreatorOpen: boolean;
  isBulkApprovalOpen: boolean;
  bulkLoading: boolean;
}

interface StatsData {
  totalShifts: number;
  nightShifts: number;
  avgHours: number;
  balanceScore: number;
}

interface Conflict {
  id: string;
  type: string;
  description: string;
}

// Helper functions
const checkCompliance = (shifts: ShiftWithEmployees[]): string[] => {
  const warnings: string[] = [];

  shifts.forEach((shift) => {
    const start = dayjs(shift.start_time, "HH:mm");
    const end = dayjs(shift.end_time, "HH:mm");
    const duration = end.diff(start, "hours");

    if (duration > 8) {
      warnings.push(`Potential overtime for shift ${shift.id}: ${duration} hours`);
    }
  });

  return warnings;
};

const generateAISchedule = async (options: string[], token: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "AI schedule generated successfully" });
    }, 2000);
  });
};

const calculateStats = (shifts: ShiftWithEmployees[], employees: Employee[]): StatsData => {
  const totalShifts = shifts.length;
  
  const nightShifts = shifts.filter(shift => {
    const startHour = parseInt(shift.start_time.split(':')[0]);
    return startHour >= 22 || startHour <= 6;
  }).length;
  
  const totalHours = shifts.reduce((sum, shift) => {
    const start = dayjs(shift.start_time, "HH:mm");
    const end = dayjs(shift.end_time, "HH:mm");
    return sum + end.diff(start, "hours");
  }, 0);
  
  const avgHours = totalShifts > 0 ? Math.round(totalHours / totalShifts * 10) / 10 : 0;
  
  const employeeShiftCount = new Map();
  shifts.forEach(shift => {
    shift.employees?.forEach(empShift => {
      const empId = empShift.employee.id;
      employeeShiftCount.set(empId, (employeeShiftCount.get(empId) || 0) + 1);
    });
  });
  
  const shiftCounts = Array.from(employeeShiftCount.values());
  const maxShifts = Math.max(...shiftCounts, 0);
  const minShifts = Math.min(...shiftCounts, maxShifts);
  const balanceScore = maxShifts > 0 ? Math.round((minShifts / maxShifts) * 100) : 100;
  
  return {
    totalShifts,
    nightShifts,
    avgHours,
    balanceScore
  };
};

const detectConflicts = (shifts: ShiftWithEmployees[], employees: Employee[]): Conflict[] => {
  const conflicts: Conflict[] = [];
  
  shifts.forEach((shift1, index) => {
    shifts.slice(index + 1).forEach((shift2) => {
      if (shift1.date === shift2.date) {
        const emp1Ids = shift1.employees?.map(e => e.employee.id) || [];
        const emp2Ids = shift2.employees?.map(e => e.employee.id) || [];
        
        const hasOverlap = emp1Ids.some(id => emp2Ids.includes(id));
        if (hasOverlap) {
          const start1 = dayjs(`${shift1.date} ${shift1.start_time}`);
          const end1 = dayjs(`${shift1.date} ${shift1.end_time}`);
          const start2 = dayjs(`${shift2.date} ${shift2.start_time}`);
          const end2 = dayjs(`${shift2.date} ${shift2.end_time}`);
          
          if (start1.isBefore(end2) && start2.isBefore(end1)) {
            conflicts.push({
              id: `conflict-${shift1.id}-${shift2.id}`,
              type: 'overlap',
              description: `Employee has overlapping shifts on ${shift1.date}`
            });
          }
        }
      }
    });
  });
  
  return conflicts;
};

const validateShiftTime = (startTime: string, endTime: string): { isValid: boolean; error?: string } => {
  const start = dayjs(startTime, "HH:mm");
  const end = dayjs(endTime, "HH:mm");
  
  if (!start.isValid() || !end.isValid()) {
    return { isValid: false, error: "Invalid time format" };
  }
  
  if (!start.isBefore(end)) {
    return { isValid: false, error: "End time must be after start time" };
  }
  
  const minStart = dayjs(DEFAULT_SHIFT_CONFIG.minStart, "HH:mm");
  if (start.isBefore(minStart)) {
    return { isValid: false, error: `Shift cannot start before ${DEFAULT_SHIFT_CONFIG.minStart}` };
  }
  
  const maxEnd = dayjs(DEFAULT_SHIFT_CONFIG.maxEnd, "HH:mm");
  if (end.isAfter(maxEnd)) {
    return { isValid: false, error: `Shift cannot end after ${DEFAULT_SHIFT_CONFIG.maxEnd}` };
  }
  
  const duration = end.diff(start, "hours");
  if (DEFAULT_SHIFT_CONFIG.allowedDurations && 
      !DEFAULT_SHIFT_CONFIG.allowedDurations.includes(duration)) {
    return { 
      isValid: false, 
      error: `Shift duration must be one of: ${DEFAULT_SHIFT_CONFIG.allowedDurations.join(', ')} hours` 
    };
  }
  
  return { isValid: true };
};

export const SchedulerPage: React.FC = () => {
  const { token } = useAuth();
  const [preLoading, setPreLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const { Content } = Layout;

  const [state, setState] = useState<ComponentState>({
    shifts: [],
    employees: [],
    clients: [],
    selectedLocation: null,
    dateRange: [dayjs().startOf("isoWeek"), dayjs().endOf("isoWeek")],
    view: "week",
    searchTerm: "",
    departmentFilter: "All",
    isTimePickerModalOpen: false,
    shiftToEdit: null,
    newTime: DEFAULT_SHIFT_TIME,
    error: null,
    loading: {
      shifts: false,
      employees: false,
      clients: false,
      general: false,
      aiScheduling: false,
    },
    openShifts: [
      {
        id: 1,
        date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        start_time: '09:00',
        end_time: '17:00',
        position: 'Janitor',
        location: 'Main Office',
        required_skills: ['Cleaning', 'Time Management']
      },
      {
        id: 2,
        date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
        start_time: '10:00',
        end_time: '18:00',
        position: 'Cleaning Supervisor',
        location: 'Downtown Branch',
        required_skills: ['Supervision', 'Communication']
      }
    ],
    shiftSwapRequests: [
      {
        id: 1,
        shift_id: 101,
        requester_id: 1,
        requested_employee_id: 2,
        status: "pending",
        reason: "Doctor appointment",
        created_at: dayjs().subtract(1, 'hour').format()
      }
    ],
    isAISchedulerModalOpen: false,
    isOpenShiftsModalOpen: false,
    isShiftSwapsModalOpen: false,
    complianceWarnings: [],
    sidebarCollapsed: false,
    selectedNavKey: "schedule",
    showStatsDashboard: false,
    selectedShiftTime: DEFAULT_SHIFT_TIME,
    showShiftTimeSelector: false,
    bulkTemplates: [],
    isBulkCreatorOpen: false,
    isBulkApprovalOpen: false,
    bulkLoading: false,
  });

  // Helper functions
  const showNotification = useCallback(
    (type: "success" | "info" | "warning" | "error", message: string, description: string) => {
      api[type]({
        message,
        description,
        placement: "topRight",
        duration: type === "error" ? 5 : 3,
      });
    },
    [api]
  );

  const getEmployeeFullName = useCallback((employee: Employee): string => {
    return `${employee.first_name || ""} ${employee.last_name || ""}`.trim() || "Unknown Employee";
  }, []);

  const handleShiftTimeSelect = useCallback((shiftTime: { start: string; end: string }) => {
    setState(prev => ({
      ...prev,
      selectedShiftTime: shiftTime,
      showShiftTimeSelector: false,
    }));
  }, []);

  // Event handlers
  const handleAddShift = useCallback(
    async (employeeId: number, date: string) => {
      if (!token || !state.selectedLocation) {
        setState(prev => ({ ...prev, error: "Authentication or location required" }));
        return;
      }

      const employee = state.employees.find(e => e.id === employeeId);
      if (!employee) {
        setState(prev => ({ ...prev, error: "Employee not found" }));
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: { ...prev.loading, shifts: true } }));

        const createShiftDto: CreateShiftWithEmployeesDto = {
          client_id: state.selectedLocation.id,
          date: dayjs(date).format("YYYY-MM-DD"),
          start_time: state.selectedShiftTime.start,
          end_time: state.selectedShiftTime.end,
          employee_ids: [employeeId],
          shift_type: "regular",
        };

        const { shift: newShift, warnings } = await apiCall.shifts.createShift(createShiftDto, token);

        setState(prev => ({
          ...prev,
          shifts: [...prev.shifts, newShift],
          loading: { ...prev.loading, shifts: false },
          error: null,
        }));

        if (warnings?.length) {
          showNotification("warning", "Shift Created With Issues", warnings.join(", "));
        } else {
          showNotification(
            "success",
            "Shift Created",
            `Shift for ${getEmployeeFullName(employee)} was successfully created`
          );
        }
      } catch (error) {
        console.error("Failed to create shift:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create shift";
        
        showNotification("error", "Create Shift Failed", errorMessage);
        
        setState(prev => ({
          ...prev,
          loading: { ...prev.loading, shifts: false },
          error: errorMessage
        }));
      }
    },
    [token, state.selectedLocation, state.employees, state.selectedShiftTime, getEmployeeFullName, showNotification]
  );

  const handleMoveShift = useCallback(
    async (shift: ShiftWithEmployees, employeeId: number, date: string) => {
      if (!token) return;

      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: true },
        }));

        const result = await apiCall.shifts.moveShiftToDate(
          shift.id,
          date,
          employeeId,
          token
        );

        setState((prev) => ({
          ...prev,
          shifts: prev.shifts
            .filter((s) => s.id !== shift.id)
            .concat(result.newShift),
          loading: { ...prev.loading, shifts: false },
          error: null,
        }));

        showNotification(
          "success",
          "Shift Moved",
          "Shift was successfully moved to new location"
        );
      } catch (error) {
        console.error("Failed to move shift:", error);
        showNotification(
          "error",
          "Move Failed",
          error instanceof Error ? error.message : "Failed to move shift"
        );
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: false },
        }));
      }
    },
    [token, showNotification]
  );

  const handleUpdateShiftTime = useCallback(async () => {
    if (!state.shiftToEdit || !token) return;

    const formattedStart = state.newTime.start.split(":").slice(0, 2).join(":");
    const formattedEnd = state.newTime.end.split(":").slice(0, 2).join(":");

    const validation = validateShiftTime(formattedStart, formattedEnd);
    if (!validation.isValid) {
      setState((prev) => ({
        ...prev,
        error: validation.error || "Invalid shift time",
      }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, shifts: true },
      }));

      const updateDto: UpdateShiftDto = {
        start_time: formattedStart,
        end_time: formattedEnd,
      };

      const updatedShift = await apiCall.shifts.updateShift(
        state.shiftToEdit.id,
        updateDto,
        token
      );

      setState((prev) => ({
        ...prev,
        shifts: prev.shifts.map((s) =>
          s.id === state.shiftToEdit!.id
            ? { ...updatedShift, employees: s.employees }
            : s
        ),
        isTimePickerModalOpen: false,
        error: null,
        loading: { ...prev.loading, shifts: false },
      }));

      showNotification(
        "success",
        "Shift Updated",
        "Shift time was successfully updated"
      );
    } catch (error) {
      console.error("Failed to update shift:", error);
      showNotification(
        "error",
        "Update Failed",
        error instanceof Error ? error.message : "Failed to update shift"
      );
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, shifts: false },
      }));
    }
  }, [state.shiftToEdit, state.newTime, token, showNotification]);

  const handleDeleteShift = useCallback(
    async (shiftId: number) => {
      if (!token) return;

      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: true },
        }));

        await apiCall.shifts.deleteShift(shiftId, token);

        setState((prev) => ({
          ...prev,
          shifts: prev.shifts.filter((shift) => shift.id !== shiftId),
          loading: { ...prev.loading, shifts: false },
          error: null,
        }));

        showNotification(
          "success",
          "Shift Deleted",
          "The shift was successfully deleted"
        );
      } catch (error) {
        console.error("Failed to delete shift:", error);
        showNotification(
          "error",
          "Delete Failed",
          error instanceof Error ? error.message : "Failed to delete shift"
        );
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: false },
        }));
      }
    },
    [token, showNotification]
  );

  const handleSwapShifts = useCallback(
    async (targetShift: ShiftWithEmployees, sourceShift: ShiftWithEmployees) => {
      if (!token) return;

      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: true },
        }));

        const getEmployeeFromShift = (shift: ShiftWithEmployees) => {
          if (!shift.employees || shift.employees.length === 0) return null;
          return shift.employees[0].employee || null;
        };

        const targetEmployee = getEmployeeFromShift(targetShift);
        const sourceEmployee = getEmployeeFromShift(sourceShift);

        if (!targetEmployee || !sourceEmployee) {
          throw new Error("Shift has no assigned employees");
        }

        const swapOperations = [
          {
            shiftId: sourceShift.id,
            newEmployeeId: targetEmployee.id,
            newDate: targetShift.date,
          },
          {
            shiftId: targetShift.id,
            newEmployeeId: sourceEmployee.id,
            newDate: sourceShift.date,
          },
        ];

        const updatedShifts = await Promise.all(
          swapOperations.map(async (operation) => {
            const { shiftId, newEmployeeId, newDate } = operation;
            const result = await apiCall.shifts.moveShiftToDate(
              shiftId,
              newDate,
              newEmployeeId,
              token
            );
            return result.newShift;
          })
        );

        setState((prev) => ({
          ...prev,
          shifts: prev.shifts
            .filter((s) => s.id !== sourceShift.id && s.id !== targetShift.id)
            .concat(updatedShifts),
          loading: { ...prev.loading, shifts: false },
          error: null,
        }));

        showNotification(
          "success",
          "Shifts Swapped",
          "Shifts were successfully swapped"
        );
      } catch (error) {
        console.error("Failed to swap shifts:", error);
        showNotification(
          "error",
          "Swap Failed",
          error instanceof Error ? error.message : "Failed to swap shifts"
        );
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: false },
        }));
      }
    },
    [token, showNotification]
  );

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    const newStart = state.dateRange[0].subtract(1, "week").startOf("isoWeek");
    setState((prev) => ({
      ...prev,
      dateRange: [newStart, newStart.endOf("isoWeek")],
    }));
  }, [state.dateRange]);

  const handleNext = useCallback(() => {
    const newStart = state.dateRange[0].add(1, "week").startOf("isoWeek");
    setState((prev) => ({
      ...prev,
      dateRange: [newStart, newStart.endOf("isoWeek")],
    }));
  }, [state.dateRange]);

  const handleToday = useCallback(() => {
    const newStart = dayjs().startOf("isoWeek");
    setState((prev) => ({
      ...prev,
      dateRange: [newStart, newStart.endOf("isoWeek")],
    }));
  }, []);

  // Data fetching effects
  useEffect(() => {
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, general: true },
        }));

        const [clients, employees] = await Promise.all([
          apiCall.clients.fetchClients(token),
          apiCall.employees.fetchEmployees(token),
        ]);

        setState((prev) => ({
          ...prev,
          clients,
          employees,
          selectedLocation: clients[0]
            ? { id: clients[0].id.toString(), name: clients[0].business_name }
            : null,
          loading: { ...prev.loading, general: false },
          error: null,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: "Failed to load initial data",
          loading: { ...prev.loading, general: false },
        }));
        console.error("Initial data fetch error:", error);
      }
    };

    fetchInitialData();
  }, [token]);

  useEffect(() => {
    if (!token || !state.selectedLocation) return;

    const fetchShiftsData = async () => {
      try {
        setPreLoading(true);
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: true },
        }));

        const shifts = await apiCall.shifts.fetchShifts(
          {
            clientId: parseInt(state.selectedLocation!.id),
            startDate: state.dateRange[0].format("YYYY-MM-DD"),
            endDate: state.dateRange[1].format("YYYY-MM-DD"),
          },
          token
        );

        setState((prev) => ({
          ...prev,
          shifts,
          loading: { ...prev.loading, shifts: false },
          error: null,
        }));
        setPreLoading(false);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Failed to load shifts",
          shifts: [],
          loading: { ...prev.loading, shifts: false },
        }));
        setPreLoading(false);
        console.error("Shift fetch error:", error);
      }
    };

    fetchShiftsData();
  }, [token, state.selectedLocation, state.dateRange]);

  // Check compliance when shifts change
  useEffect(() => {
    if (state.shifts.length > 0) {
      const warnings = checkCompliance(state.shifts);
      setState(prev => ({ ...prev, complianceWarnings: warnings }));
    }
  }, [state.shifts]);

  // Add new handlers
  const handleCreateBulkTemplate = useCallback(async (template: BulkShiftCreationDto) => {
    if (!token) return;
    
    try {
      setState(prev => ({ ...prev, bulkLoading: true }));
      await apiCall.shifts.createBulkTemplate(template, token);
      showNotification('success', 'Template Created', 'Bulk shift template saved for approval');
      setState(prev => ({ ...prev, isBulkCreatorOpen: false }));
      loadBulkTemplates();
    } catch (error) {
      showNotification('error', 'Creation Failed', 'Failed to create bulk template');
    } finally {
      setState(prev => ({ ...prev, bulkLoading: false }));
    }
  }, [token, showNotification]);

  const handleApproveTemplate = useCallback(async (templateId: number) => {
    if (!token) return;
    
    try {
      setState(prev => ({ ...prev, bulkLoading: true }));
      const result = await apiCall.shifts.approveBulkTemplate(templateId, token);
      showNotification('success', 'Template Approved', `Created ${result.created_shifts} shifts`);
      // Refresh templates
      loadBulkTemplates();
    } catch (error) {
      showNotification('error', 'Approval Failed', 'Failed to approve template');
    } finally {
      setState(prev => ({ ...prev, bulkLoading: false }));
    }
  }, [token, showNotification]);

  const handleRejectTemplate = useCallback(async (templateId: number, reason: string) => {
    if (!token) return;
    
    try {
      setState(prev => ({ ...prev, bulkLoading: true }));
      await apiCall.shifts.rejectBulkTemplate(templateId, reason, token);
      showNotification('info', 'Template Rejected', 'Bulk shift template was rejected');
      loadBulkTemplates();
    } catch (error) {
      showNotification('error', 'Rejection Failed', 'Failed to reject template');
    } finally {
      setState(prev => ({ ...prev, bulkLoading: false }));
    }
  }, [token, showNotification]);

  const loadBulkTemplates = useCallback(async () => {
    if (!token) return;
    
    try {
      const templates = await apiCall.shifts.getBulkTemplates('pending_approval');
      setState(prev => ({ ...prev, bulkTemplates: templates }));
    } catch (error) {
      console.error('Failed to load bulk templates:', error);
    }
  }, [token]);

  // Load templates on mount
  useEffect(() => {
    loadBulkTemplates();
  }, [loadBulkTemplates]);

  // Memoized data
  const filteredEmployees = useMemo(() => {
    return state.employees.filter((employee) => {
      if (!state.selectedLocation) return false;

      const matchesLocation = employee.assigned_locations?.includes(
        state.selectedLocation.name
      );
      const search = state.searchTerm.toLowerCase();
      const fullName = getEmployeeFullName(employee).toLowerCase();
      const position = employee.position?.toLowerCase() ?? "";

      const matchesSearch =
        search === "" || fullName.includes(search) || position.includes(search);
      const matchesDepartment =
        state.departmentFilter === "All" ||
        employee.position === state.departmentFilter;

      return matchesLocation && matchesSearch && matchesDepartment;
    });
  }, [
    state.employees,
    state.selectedLocation,
    state.searchTerm,
    state.departmentFilter,
    getEmployeeFullName,
  ]);

  const displayedShifts = useMemo(() => {
    if (!state.selectedLocation) return [];

    return state.shifts
      .filter((shift) => {
        const isDateInRange =
          state.view === "day"
            ? dayjs(shift.date).isSame(state.dateRange[0], "day")
            : dayjs(shift.date).isBetween(
                state.dateRange[0],
                state.dateRange[1],
                "day",
                "[]"
              );

        return (
          shift.client_id === parseInt(state.selectedLocation!.id) &&
          isDateInRange
        );
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [state.shifts, state.selectedLocation, state.view, state.dateRange]);

  const daysInView = useMemo(() => {
    if (state.view === "day") return [state.dateRange[0]];

    const days: Dayjs[] = [];
    let current = state.dateRange[0].clone();

    while (current.isSameOrBefore(state.dateRange[1])) {
      days.push(current.clone());
      current = current.add(1, "day");
    }
    return days;
  }, [state.view, state.dateRange]);

  // Calculate stats and conflicts
  const stats = useMemo(() => calculateStats(displayedShifts, filteredEmployees), [displayedShifts, filteredEmployees]);
  const conflicts = useMemo(() => detectConflicts(displayedShifts, filteredEmployees), [displayedShifts, filteredEmployees]);

  // Render loading state if no location selected
  if (!state.selectedLocation && state.clients.length > 0) {
    return (
      <div className="p-4">
        <Alert
          message="Please select a location"
          type="info"
          showIcon
          className="mb-4"
        />
      </div>
    );
  }

  // Main render
  return (
    <DndProvider backend={HTML5Backend}>
      <Layout className="min-h-screen">
        {contextHolder}

        <Layout>
          <Content className="overflow-auto">
            {preLoading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <ScheduleHeaderWithFilters
                  clients={state.clients}
                  selectedLocation={state.selectedLocation}
                  dateRange={state.dateRange}
                  view={state.view}
                  bulkTemplatesCount={state.bulkTemplates.length}
                  searchTerm={state.searchTerm}
                  departmentFilter={state.departmentFilter}
                  loading={state.loading}
                  openShiftsCount={state.openShifts.length}
                  pendingSwapsCount={state.shiftSwapRequests.filter(r => r.status === "pending").length}
                  onViewChange={(view) => setState(prev => ({ ...prev, view }))}
                  onDateRangeChange={(dates) => setState(prev => ({ ...prev, dateRange: dates }))}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onToday={handleToday}
                  onLocationChange={(locationId) => {
                    const client = state.clients.find((c) => c.id.toString() === locationId);
                    if (client) {
                      setState((prev) => ({
                        ...prev,
                        selectedLocation: {
                          id: client.id.toString(),
                          name: client.business_name,
                        },
                      }));
                    }
                  }}
                  onSearchChange={(searchTerm) => setState(prev => ({ ...prev, searchTerm }))}
                  onDepartmentChange={(departmentFilter) => setState(prev => ({ ...prev, departmentFilter }))}
                  onPrint={() => console.log("Print functionality")}
                  onExport={() => console.log("Export functionality")}
                  onOpenAIScheduler={() => setState(prev => ({ ...prev, isAISchedulerModalOpen: true }))}
                  onOpenShifts={() => setState(prev => ({ ...prev, isOpenShiftsModalOpen: true }))}
                  onShiftSwaps={() => setState(prev => ({ ...prev, isShiftSwapsModalOpen: true }))}
                  selectedShiftTime={state.selectedShiftTime}
                  showShiftTimeSelector={state.showShiftTimeSelector}
                  onShiftTimeSelect={handleShiftTimeSelect}
                  onToggleShiftTimeSelector={() => 
                    setState(prev => ({ 
                      ...prev, 
                      showShiftTimeSelector: !prev.showShiftTimeSelector 
                    }))
                  }
                  onOpenBulkCreator={() => setState(prev => ({ ...prev, isBulkCreatorOpen: true }))}
                  onOpenBulkApproval={() => setState(prev => ({ ...prev, isBulkApprovalOpen: true }))}
                />

                <BulkShiftCreator
                  visible={state.isBulkCreatorOpen}
                  onClose={() => setState(prev => ({ ...prev, isBulkCreatorOpen: false }))}
                  onCreate={handleCreateBulkTemplate}
                  loading={state.bulkLoading}
                  shifts={displayedShifts}
                  selectedWeek={state.dateRange}
                />

                <BulkShiftApproval
                  visible={state.isBulkApprovalOpen}
                  onClose={() => setState(prev => ({ ...prev, isBulkApprovalOpen: false }))}
                  templates={state.bulkTemplates}
                  onApprove={handleApproveTemplate}
                  onReject={handleRejectTemplate}
                  loading={state.bulkLoading}
                />

                {/* Error Display */}
                {state.error && (
                  <Alert
                    message={state.error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setState((prev) => ({ ...prev, error: null }))}
                    className="mb-6 rounded-xl"
                  />
                )}

                {/* Stats Dashboard */}
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      showStatsDashboard: !prev.showStatsDashboard,
                    }))
                  }
                  className="px-3 py-1 text-sm bg-white rounded mb-3 text-black border border-gray-300 hover:bg-gray-100 transition "
                >
                  {state.showStatsDashboard ? "Hide Stats" : "Show Stats"}
                </button>
                <DashboardStats
                  stats={{
                    ...stats,
                    conflicts: conflicts.length,
                  }}
                  show={state.showStatsDashboard}
                />

                {/* Compliance Warnings */}
                <ComplianceWarnings
                  warnings={state.complianceWarnings}
                  onClose={() => setState(prev => ({ ...prev, complianceWarnings: [] }))}
                />

                {/* Schedule Grid */}
                {state.loading.shifts ? (
                  <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-xs border border-gray-200">
                    <Spin size="large" />
                  </div>
                ) : (
                  <ScheduleGrid
                    employees={filteredEmployees}
                    daysInView={daysInView}
                    shifts={displayedShifts}
                    view={state.view}
                    loading={state.loading.shifts}
                    onAddShift={handleAddShift}
                    onMoveShift={handleMoveShift}
                    onSwapShifts={handleSwapShifts}
                    onDeleteShift={handleDeleteShift}
                    onEditShift={(shift) => {
                      setState((prev) => ({
                        ...prev,
                        shiftToEdit: shift,
                        newTime: {
                          start: shift.start_time,
                          end: shift.end_time,
                        },
                        isTimePickerModalOpen: true,
                      }));
                    }}
                    getEmployeeFullName={getEmployeeFullName}
                  />
                )}

                {/* Modals */}
                <EditShiftTimeModal
                  visible={state.isTimePickerModalOpen}
                  shift={state.shiftToEdit}
                  newTime={state.newTime}
                  error={state.error}
                  loading={state.loading.shifts}
                  onOk={handleUpdateShiftTime}
                  onCancel={() =>
                    setState((prev) => ({
                      ...prev,
                      isTimePickerModalOpen: false,
                      error: null,
                    }))
                  }
                  onTimeChange={(type, value) =>
                    setState((prev) => ({
                      ...prev,
                      newTime: { ...prev.newTime, [type]: value },
                    }))
                  }
                />

                <AISchedulerModal
                  visible={state.isAISchedulerModalOpen}
                  onCancel={() => setState(prev => ({ ...prev, isAISchedulerModalOpen: false }))}
                  onGenerate={async (options) => {
                    if (!token) return;
                    
                    setState(prev => ({ ...prev, loading: { ...prev.loading, aiScheduling: true } }));
                    try {
                      await generateAISchedule(options, token);
                      showNotification("success", "AI Schedule Generated", "The schedule has been optimized based on your criteria");
                      setState(prev => ({ 
                        ...prev, 
                        isAISchedulerModalOpen: false,
                        loading: { ...prev.loading, aiScheduling: false }
                      }));
                    } catch (error) {
                      showNotification("error", "AI Scheduling Failed", "Failed to generate optimized schedule");
                      setState(prev => ({ 
                        ...prev, 
                        loading: { ...prev.loading, aiScheduling: false }
                      }));
                    }
                  }}
                  loading={state.loading.aiScheduling}
                />

                <OpenShiftsModal
                  visible={state.isOpenShiftsModalOpen}
                  openShifts={state.openShifts}
                  onClose={() => setState(prev => ({ ...prev, isOpenShiftsModalOpen: false }))}
                  onClaim={async (shiftId) => {
                    showNotification("success", "Shift Claimed", "You have successfully claimed the shift");
                    setState(prev => ({
                      ...prev,
                      openShifts: prev.openShifts.filter(s => s.id !== shiftId),
                      isOpenShiftsModalOpen: false
                    }));
                  }}
                />

                <ShiftSwapsModal
                  visible={state.isShiftSwapsModalOpen}
                  swapRequests={state.shiftSwapRequests}
                  employees={state.employees}
                  onClose={() => setState(prev => ({ ...prev, isShiftSwapsModalOpen: false }))}
                  onApprove={async (requestId) => {
                    showNotification("success", "Request Approved", "Shift swap has been approved");
                    setState(prev => ({
                      ...prev,
                      shiftSwapRequests: prev.shiftSwapRequests.map(r => 
                        r.id === requestId ? { ...r, status: "approved" } : r
                      )
                    }));
                  }}
                  onReject={async (requestId) => {
                    showNotification("info", "Request Rejected", "Shift swap has been rejected");
                    setState(prev => ({
                      ...prev,
                      shiftSwapRequests: prev.shiftSwapRequests.map(r => 
                        r.id === requestId ? { ...r, status: "rejected" } : r
                      )
                    }));
                  }}
                  getEmployeeFullName={getEmployeeFullName}
                />
              </div>
            )}
          </Content>
        </Layout>
      </Layout>
    </DndProvider>
  );
};

export default SchedulerPage;












// import React, {
//   useState,
//   useEffect,
//   useMemo,
//   useCallback,
// } from "react";
// import { DndProvider } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import { Alert, Spin, notification } from "antd";
// import dayjs, { Dayjs } from "dayjs";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import isBetween from "dayjs/plugin/isBetween";
// import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
// import isoWeek from "dayjs/plugin/isoWeek";
// import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";

// // Import custom components
// import { AISchedulerModal } from "@/components/ui/shift/AISchedulerModal";
// import { OpenShiftsModal } from "@/components/ui/shift/OpenShiftsModal";
// import { ShiftSwapsModal } from "@/components/ui/shift/ShiftSwapsModal";
// import { ScheduleHeader } from "@/components/ui/shift/ScheduleHeader";
// import { ScheduleFilters } from "@/components/ui/shift/ScheduleFilters";
// import { ComplianceWarnings } from "@/components/ui/shift/ComplianceWarnings";
// import { ScheduleGrid } from "@/components/ui/shift/ScheduleGrid";
// import { EditShiftTimeModal } from "@/components/ui/shift/EditShiftTimeModal";

// // Import types
// import { Client } from "@/lib/types/client";
// import { Employee } from "@/lib/types/employee";
// import { useAuth } from "../../components/providers/AuthProvider";
// import { api as apiCall } from "@/lib/api";
// import {
//   ShiftWithEmployees,
//   CreateShiftWithEmployeesDto,
//   UpdateShiftDto,
// } from "@/lib/types/shift";
// import { Skeleton } from "@/components/ui/common/skeleton";
// import { AlertCircle, CheckCircle, Clock, Settings } from "lucide-react";

// // Day.js extensions
// dayjs.extend(isBetween);
// dayjs.extend(customParseFormat);
// dayjs.extend(isSameOrBefore);
// dayjs.extend(isoWeek);
// dayjs.extend(isoWeeksInYear);

// // Constants and interfaces
// const DEFAULT_SHIFT_TIME = { start: "08:00", end: "16:00" };

// interface LocationData {
//   id: string;
//   name: string;
// }

// interface LoadingState {
//   shifts: boolean;
//   employees: boolean;
//   clients: boolean;
//   general: boolean;
//   aiScheduling: boolean;
// }

// interface OpenShift {
//   id: number;
//   date: string;
//   start_time: string;
//   end_time: string;
//   position: string;
//   location: string;
//   required_skills: string[];
// }

// interface ShiftSwapRequest {
//   id: number;
//   shift_id: number;
//   requester_id: number;
//   requested_employee_id: number;
//   status: "pending" | "approved" | "rejected";
//   reason: string;
//   created_at: string;
// }

// interface ComponentState {
//   shifts: ShiftWithEmployees[];
//   employees: Employee[];
//   clients: Client[];
//   selectedLocation: LocationData | null;
//   dateRange: [Dayjs, Dayjs];
//   view: "day" | "week" | "month";
//   searchTerm: string;
//   departmentFilter: string;
//   isTimePickerModalOpen: boolean;
//   shiftToEdit: ShiftWithEmployees | null;
//   newTime: { start: string; end: string };
//   error: string | null;
//   loading: LoadingState;
//   openShifts: OpenShift[];
//   shiftSwapRequests: ShiftSwapRequest[];
//   isAISchedulerModalOpen: boolean;
//   isOpenShiftsModalOpen: boolean;
//   isShiftSwapsModalOpen: boolean;
//   complianceWarnings: string[];
// }

// // Helper functions
// const checkCompliance = (shifts: ShiftWithEmployees[]): string[] => {
//   const warnings: string[] = [];

//   shifts.forEach((shift) => {
//     const start = dayjs(shift.start_time, "HH:mm");
//     const end = dayjs(shift.end_time, "HH:mm");
//     const duration = end.diff(start, "hours");

//     if (duration > 8) {
//       warnings.push(`Potential overtime for shift ${shift.id}: ${duration} hours`);
//     }
//   });

//   return warnings;
// };

// const generateAISchedule = async (options: string[], token: string) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({ success: true, message: "AI schedule generated successfully" });
//     }, 2000);
//   });
// };

// export const SchedulerPage: React.FC = () => {
//   const { token } = useAuth();
//   const [preLoading, setPreLoading] = useState(false);
//   const [api, contextHolder] = notification.useNotification();

//   const [state, setState] = useState<ComponentState>({
//     shifts: [],
//     employees: [],
//     clients: [],
//     selectedLocation: null,
//     dateRange: [dayjs().startOf("isoWeek"), dayjs().endOf("isoWeek")],
//     view: "week",
//     searchTerm: "",
//     departmentFilter: "All",
//     isTimePickerModalOpen: false,
//     shiftToEdit: null,
//     newTime: DEFAULT_SHIFT_TIME,
//     error: null,
//     loading: {
//       shifts: false,
//       employees: false,
//       clients: false,
//       general: false,
//       aiScheduling: false,
//     },
//     openShifts: [
//       {
//         id: 1,
//         date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
//         start_time: '09:00',
//         end_time: '17:00',
//         position: 'Janitor',
//         location: 'Main Office',
//         required_skills: ['Cleaning', 'Time Management']
//       },
//       {
//         id: 2,
//         date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
//         start_time: '10:00',
//         end_time: '18:00',
//         position: 'Cleaning Supervisor',
//         location: 'Downtown Branch',
//         required_skills: ['Supervision', 'Communication']
//       }
//     ],
//     shiftSwapRequests: [
//       {
//         id: 1,
//         shift_id: 101,
//         requester_id: 1,
//         requested_employee_id: 2,
//         status: "pending",
//         reason: "Doctor appointment",
//         created_at: dayjs().subtract(1, 'hour').format()
//       }
//     ],
//     isAISchedulerModalOpen: false,
//     isOpenShiftsModalOpen: false,
//     isShiftSwapsModalOpen: false,
//     complianceWarnings: []
//   });

//   // Helper functions
//   const showNotification = useCallback(
//     (
//       type: "success" | "info" | "warning" | "error",
//       message: string,
//       description: string
//     ) => {
//       api[type]({
//         message,
//         description,
//         placement: "topRight",
//         duration: type === "error" ? 5 : 3,
//       });
//     },
//     [api]
//   );

//   const getEmployeeFullName = useCallback((employee: Employee): string => {
//     if (!employee.user) {
//       return (
//         `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
//         "Unknown Employee"
//       );
//     }
//     return (
//       `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
//       "Unknown Employee"
//     );
//   }, []);

//   const validateShiftTime = useCallback(
//     (startTime: string, endTime: string): boolean => {
//       const start = dayjs(startTime, "HH:mm");
//       const end = dayjs(endTime, "HH:mm");
//       return start.isBefore(end);
//     },
//     []
//   );

//   // Event handlers
// const handleAddShift = useCallback(
//   async (employeeId: number, date: string) => {
//     if (!token || !state.selectedLocation) {
//       setState(prev => ({ ...prev, error: "Authentication or location required" }));
//       return;
//     }

//     const employee = state.employees.find(e => e.id === employeeId);
//     if (!employee) {
//       setState(prev => ({ ...prev, error: "Employee not found" }));
//       return;
//     }

//     try {
//       setState(prev => ({ ...prev, loading: { ...prev.loading, shifts: true } }));

//       const createShiftDto: CreateShiftWithEmployeesDto = {
//         client_id: state.selectedLocation.id, // Assuming id is already number
//         date: dayjs(date).format("YYYY-MM-DD"),
//         start_time: DEFAULT_SHIFT_TIME.start,
//         end_time: DEFAULT_SHIFT_TIME.end,
//         employee_ids: [employeeId],
//         shift_type: "regular",
//       };

//     const { shift: newShift, warnings } = await apiCall.shifts.createShift(createShiftDto, token);

// setState(prev => ({
//   ...prev,
//   shifts: [...prev.shifts, newShift],
//   loading: { ...prev.loading, shifts: false },
//   error: null,
// }));

// if (warnings?.length) {
//   showNotification("warning", "Shift Created With Issues", warnings.join(", "));
// } else {
//   showNotification(
//     "success",
//     "Shift Created",
//     `Shift for ${getEmployeeFullName(employee)} was successfully created`
//   );
// }

//       showNotification(
//         "success",
//         "Shift Created",
//         `Shift for ${getEmployeeFullName(employee)} was successfully created`
//       );
//     } catch (error) {
//       console.error("Failed to create shift:", error);
//       const errorMessage = error instanceof Error ? error.message : "Failed to create shift";

//       showNotification("error", "Create Shift Failed", errorMessage);

//       setState(prev => ({
//         ...prev,
//         loading: { ...prev.loading, shifts: false },
//         error: errorMessage
//       }));
//     }
//   },
//   [token, state.selectedLocation, state.employees, getEmployeeFullName, showNotification]
// );

//   const handleMoveShift = useCallback(
//     async (shift: ShiftWithEmployees, employeeId: number, date: string) => {
//       if (!token) return;

//       try {
//         setState((prev) => ({
//           ...prev,
//           loading: { ...prev.loading, shifts: true },
//         }));

//         const result = await apiCall.shifts.moveShiftToDate(
//           shift.id,
//           date,
//           employeeId,
//           token
//         );

//         setState((prev) => ({
//           ...prev,
//           shifts: prev.shifts
//             .filter((s) => s.id !== shift.id)
//             .concat(result.newShift),
//           loading: { ...prev.loading, shifts: false },
//           error: null,
//         }));

//         showNotification(
//           "success",
//           "Shift Moved",
//           "Shift was successfully moved to new location"
//         );
//       } catch (error) {
//         console.error("Failed to move shift:", error);
//         showNotification(
//           "error",
//           "Move Failed",
//           error instanceof Error ? error.message : "Failed to move shift"
//         );
//         setState((prev) => ({
//           ...prev,
//           loading: { ...prev.loading, shifts: false },
//         }));
//       }
//     },
//     [token, showNotification]
//   );

//   const handleUpdateShiftTime = useCallback(async () => {
//     if (!state.shiftToEdit || !token) return;

//     const formattedStart = state.newTime.start.split(":").slice(0, 2).join(":");
//     const formattedEnd = state.newTime.end.split(":").slice(0, 2).join(":");

//     if (!validateShiftTime(formattedStart, formattedEnd)) {
//       setState((prev) => ({
//         ...prev,
//         error: "End time must be after start time",
//       }));
//       return;
//     }

//     try {
//       setState((prev) => ({
//         ...prev,
//         loading: { ...prev.loading, shifts: true },
//       }));

//       const updateDto: UpdateShiftDto = {
//         start_time: formattedStart,
//         end_time: formattedEnd,
//       };

//       const updatedShift = await apiCall.shifts.updateShift(
//         state.shiftToEdit.id,
//         updateDto,
//         token
//       );

//       setState((prev) => ({
//         ...prev,
//         shifts: prev.shifts.map((s) =>
//           s.id === state.shiftToEdit!.id
//             ? { ...updatedShift, employees: s.employees }
//             : s
//         ),
//         isTimePickerModalOpen: false,
//         error: null,
//         loading: { ...prev.loading, shifts: false },
//       }));

//       showNotification(
//         "success",
//         "Shift Updated",
//         "Shift time was successfully updated"
//       );
//     } catch (error) {
//       console.error("Failed to update shift:", error);
//       showNotification(
//         "error",
//         "Update Failed",
//         error instanceof Error ? error.message : "Failed to update shift"
//       );
//       setState((prev) => ({
//         ...prev,
//         loading: { ...prev.loading, shifts: false },
//       }));
//     }
//   }, [
//     state.shiftToEdit,
//     state.newTime,
//     token,
//     validateShiftTime,
//     showNotification,
//   ]);

//   const handleDeleteShift = useCallback(
//     async (shiftId: number) => {
//       if (!token) return;

//       try {
//         setState((prev) => ({
//           ...prev,
//           loading: { ...prev.loading, shifts: true },
//         }));

//         await apiCall.shifts.deleteShift(shiftId, token);

//         setState((prev) => ({
//           ...prev,
//           shifts: prev.shifts.filter((shift) => shift.id !== shiftId),
//           loading: { ...prev.loading, shifts: false },
//           error: null,
//         }));

//         showNotification(
//           "success",
//           "Shift Deleted",
//           "The shift was successfully deleted"
//         );
//       } catch (error) {
//         console.error("Failed to delete shift:", error);
//         showNotification(
//           "error",
//           "Delete Failed",
//           error instanceof Error ? error.message : "Failed to delete shift"
//         );
//         setState((prev) => ({
//           ...prev,
//           loading: { ...prev.loading, shifts: false },
//         }));
//       }
//     },
//     [token, showNotification]
//   );

//   const handleSwapShifts = useCallback(
//     async (
//       targetShift: ShiftWithEmployees,
//       sourceShift: ShiftWithEmployees
//     ) => {
//       if (!token) return;

//       try {
//         setState((prev) => ({
//           ...prev,
//           loading: { ...prev.loading, shifts: true },
//         }));

//         const getEmployeeFromShift = (shift: ShiftWithEmployees) => {
//           if (!shift.employees || shift.employees.length === 0) return null;
//           return shift.employees[0].employee || null;
//         };

//         const targetEmployee = getEmployeeFromShift(targetShift);
//         const sourceEmployee = getEmployeeFromShift(sourceShift);

//         if (!targetEmployee || !sourceEmployee) {
//           throw new Error("Shift has no assigned employees");
//         }

//         const swapOperations = [
//           {
//             shiftId: sourceShift.id,
//             newEmployeeId: targetEmployee.id,
//             newDate: targetShift.date,
//           },
//           {
//             shiftId: targetShift.id,
//             newEmployeeId: sourceEmployee.id,
//             newDate: sourceShift.date,
//           },
//         ];

//         const updatedShifts = await Promise.all(
//           swapOperations.map(async (operation) => {
//             const { shiftId, newEmployeeId, newDate } = operation;
//             const result = await apiCall.shifts.moveShiftToDate(
//               shiftId,
//               newDate,
//               newEmployeeId,
//               token
//             );
//             return result.newShift;
//           })
//         );

//         setState((prev) => ({
//           ...prev,
//           shifts: prev.shifts
//             .filter((s) => s.id !== sourceShift.id && s.id !== targetShift.id)
//             .concat(updatedShifts),
//           loading: { ...prev.loading, shifts: false },
//           error: null,
//         }));

//         showNotification(
//           "success",
//           "Shifts Swapped",
//           "Shifts were successfully swapped"
//         );
//       } catch (error) {
//         console.error("Failed to swap shifts:", error);
//         showNotification(
//           "error",
//           "Swap Failed",
//           error instanceof Error ? error.message : "Failed to swap shifts"
//         );
//         setState((prev) => ({
//           ...prev,
//           loading: { ...prev.loading, shifts: false },
//         }));
//       }
//     },
//     [token, showNotification]
//   );

//   // Navigation handlers
//   const handlePrevious = useCallback(() => {
//     const newStart = state.dateRange[0].subtract(1, "week").startOf("isoWeek");
//     setState((prev) => ({
//       ...prev,
//       dateRange: [newStart, newStart.endOf("isoWeek")],
//     }));
//   }, [state.dateRange]);

//   const handleNext = useCallback(() => {
//     const newStart = state.dateRange[0].add(1, "week").startOf("isoWeek");
//     setState((prev) => ({
//       ...prev,
//       dateRange: [newStart, newStart.endOf("isoWeek")],
//     }));
//   }, [state.dateRange]);

//   const handleToday = useCallback(() => {
//     const newStart = dayjs().startOf("isoWeek");
//     setState((prev) => ({
//       ...prev,
//       dateRange: [newStart, newStart.endOf("isoWeek")],
//     }));
//   }, []);

//   // Data fetching effects
//   useEffect(() => {
//     if (!token) return;

//     const fetchInitialData = async () => {
//       try {
//         setState((prev) => ({
//           ...prev,
//           loading: { ...prev.loading, general: true },
//         }));

//         const [clients, employees] = await Promise.all([
//           apiCall.clients.fetchClients(token),
//           apiCall.employees.fetchEmployees(token),
//         ]);

//         setState((prev) => ({
//           ...prev,
//           clients,
//           employees,
//           selectedLocation: clients[0]
//             ? { id: clients[0].id.toString(), name: clients[0].business_name }
//             : null,
//           loading: { ...prev.loading, general: false },
//           error: null,
//         }));
//       } catch (error) {
//         setState((prev) => ({
//           ...prev,
//           error: "Failed to load initial data",
//           loading: { ...prev.loading, general: false },
//         }));
//         console.error("Initial data fetch error:", error);
//       }
//     };

//     fetchInitialData();
//   }, [token]);

//   useEffect(() => {
//     if (!token || !state.selectedLocation) return;

//     const fetchShiftsData = async () => {
//       try {
//         setPreLoading(true);
//         setState((prev) => ({
//           ...prev,
//           loading: { ...prev.loading, shifts: true },
//         }));

//         const shifts = await apiCall.shifts.fetchShifts(
//           {
//             clientId: parseInt(state.selectedLocation!.id),
//             startDate: state.dateRange[0].format("YYYY-MM-DD"),
//             endDate: state.dateRange[1].format("YYYY-MM-DD"),
//           },
//           token
//         );

//         setState((prev) => ({
//           ...prev,
//           shifts,
//           loading: { ...prev.loading, shifts: false },
//           error: null,
//         }));
//         setPreLoading(false);
//       } catch (error) {
//         setState((prev) => ({
//           ...prev,
//           error:
//             error instanceof Error ? error.message : "Failed to load shifts",
//           shifts: [],
//           loading: { ...prev.loading, shifts: false },
//         }));
//         setPreLoading(false);
//         console.error("Shift fetch error:", error);
//       }
//     };

//     fetchShiftsData();
//   }, [token, state.selectedLocation, state.dateRange]);

//   // Check compliance when shifts change
//   useEffect(() => {
//     if (state.shifts.length > 0) {
//       const warnings = checkCompliance(state.shifts);
//       setState(prev => ({ ...prev, complianceWarnings: warnings }));
//     }
//   }, [state.shifts]);

//   // Memoized data
//   const filteredEmployees = useMemo(() => {
//     return state.employees.filter((employee) => {
//       if (!state.selectedLocation) return false;

//       const matchesLocation = employee.assigned_locations?.includes(
//         state.selectedLocation.name
//       );
//       const search = state.searchTerm.toLowerCase();
//       const fullName = getEmployeeFullName(employee).toLowerCase();
//       const position = employee.position?.toLowerCase() ?? "";

//       const matchesSearch =
//         search === "" || fullName.includes(search) || position.includes(search);
//       const matchesDepartment =
//         state.departmentFilter === "All" ||
//         employee.position === state.departmentFilter;

//       return matchesLocation && matchesSearch && matchesDepartment;
//     });
//   }, [
//     state.employees,
//     state.selectedLocation,
//     state.searchTerm,
//     state.departmentFilter,
//     getEmployeeFullName,
//   ]);

//   const displayedShifts = useMemo(() => {
//     if (!state.selectedLocation) return [];

//     return state.shifts
//       .filter((shift) => {
//         const isDateInRange =
//           state.view === "day"
//             ? dayjs(shift.date).isSame(state.dateRange[0], "day")
//             : dayjs(shift.date).isBetween(
//                 state.dateRange[0],
//                 state.dateRange[1],
//                 "day",
//                 "[]"
//               );

//         return (
//           shift.client_id === parseInt(state.selectedLocation!.id) &&
//           isDateInRange
//         );
//       })
//       .sort((a, b) => a.start_time.localeCompare(b.start_time));
//   }, [state.shifts, state.selectedLocation, state.view, state.dateRange]);

//   const daysInView = useMemo(() => {
//     if (state.view === "day") return [state.dateRange[0]];

//     const days: Dayjs[] = [];
//     let current = state.dateRange[0].clone();

//     while (current.isSameOrBefore(state.dateRange[1])) {
//       days.push(current.clone());
//       current = current.add(1, "day");
//     }
//     return days;
//   }, [state.view, state.dateRange]);

//   // Render loading state if no location selected
//   if (!state.selectedLocation && state.clients.length > 0) {
//     return (
//       <div className="p-4">
//         <Alert
//           message="Please select a location"
//           type="info"
//           showIcon
//           className="mb-4"
//         />
//       </div>
//     );
//   }

//    const calculateStats = (scheduleData, employeeData) => {
//     const employeeStats = {};
//     let totalShifts = 0;
//     let nightShifts = 0;

//     // Initialize stats
//     employeeData.forEach(emp => {
//       employeeStats[emp.id] = { shifts: 0, hours: 0, nightShifts: 0 };
//     });

//     // Calculate from schedule
//     Object.keys(scheduleData).forEach(day => {
//       Object.keys(scheduleData[day]).forEach(shift => {
//         Object.keys(scheduleData[day][shift]).forEach(dept => {
//           scheduleData[day][shift][dept].forEach(emp => {
//             employeeStats[emp.id].shifts++;
//             employeeStats[emp.id].hours += shiftTypes[shift].hours;
//             totalShifts++;

//             if (shift === 'night') {
//               employeeStats[emp.id].nightShifts++;
//               nightShifts++;
//             }
//           });
//         });
//       });
//     });

//   // Main render
//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div className="min-h-screen">
//         {contextHolder}

//         {preLoading ? (
//           <div className="p-4 space-y-4">
//             <Skeleton className="h-10 w-full rounded-lg" />
//             {[...Array(5)].map((_, i) => (
//               <Skeleton key={i} className="h-16 w-full rounded-lg" />
//             ))}
//           </div>
//         ) : (
//           <div className="max-w-7xl mx-auto">
//             {/* Header */}
//             <ScheduleHeader
//               selectedLocation={state.selectedLocation}
//               dateRange={state.dateRange}
//               view={state.view}
//               onViewChange={(view) => setState(prev => ({ ...prev, view }))}
//               onDateRangeChange={(dates) => setState(prev => ({ ...prev, dateRange: dates }))}
//               onPrevious={handlePrevious}
//               onNext={handleNext}
//               onToday={handleToday}
//             />

//             {/* Error Display */}
//             {state.error && (
//               <Alert
//                 message={state.error}
//                 type="error"
//                 showIcon
//                 closable
//                 onClose={() => setState((prev) => ({ ...prev, error: null }))}
//                 className="mb-6 rounded-lg"
//               />
//             )}
// {/* Stats Dashboard */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
//           <div className="bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center gap-2">
//               <Users className="text-blue-600" size={20} />
//               <span className="text-sm font-medium text-gray-600">Total Shifts</span>
//             </div>
//             <p className="text-2xl font-bold text-gray-900">{stats.totalShifts || 0}</p>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center gap-2">
//               <Clock className="text-purple-600" size={20} />
//               <span className="text-sm font-medium text-gray-600">Night Shifts</span>
//             </div>
//             <p className="text-2xl font-bold text-gray-900">{stats.nightShifts || 0}</p>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center gap-2">
//               <CheckCircle className="text-green-600" size={20} />
//               <span className="text-sm font-medium text-gray-600">Avg Hours</span>
//             </div>
//             <p className="text-2xl font-bold text-gray-900">{stats.avgHours || 0}</p>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center gap-2">
//               <Settings className="text-orange-600" size={20} />
//               <span className="text-sm font-medium text-gray-600">Balance Score</span>
//             </div>
//             <p className="text-2xl font-bold text-gray-900">{stats.balanceScore || 0}%</p>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-4">
//             <div className="flex items-center gap-2">
//               <AlertCircle className="text-red-600" size={20} />
//               <span className="text-sm font-medium text-gray-600">Conflicts</span>
//             </div>
//             <p className="text-2xl font-bold text-gray-900">{conflicts.length}</p>
//           </div>
//         </div>

//             {/* Compliance Warnings */}
//             <ComplianceWarnings
//               warnings={state.complianceWarnings}
//               onClose={() => setState(prev => ({ ...prev, complianceWarnings: [] }))}
//             />

//             {/* Filters */}
//             <ScheduleFilters
//               clients={state.clients}
//               selectedLocation={state.selectedLocation}
//               searchTerm={state.searchTerm}
//               departmentFilter={state.departmentFilter}
//               loading={state.loading}
//               openShiftsCount={state.openShifts.length}
//               pendingSwapsCount={state.shiftSwapRequests.filter(r => r.status === "pending").length}
//               onLocationChange={(locationId) => {
//                 const client = state.clients.find((c) => c.id.toString() === locationId);
//                 if (client) {
//                   setState((prev) => ({
//                     ...prev,
//                     selectedLocation: {
//                       id: client.id.toString(),
//                       name: client.business_name,
//                     },
//                   }));
//                 }
//               }}
//               onSearchChange={(searchTerm) => setState(prev => ({ ...prev, searchTerm }))}
//               onDepartmentChange={(departmentFilter) => setState(prev => ({ ...prev, departmentFilter }))}
//               onPrint={() => console.log("Print functionality")}
//               onExport={() => console.log("Export functionality")}
//               onOpenAIScheduler={() => setState(prev => ({ ...prev, isAISchedulerModalOpen: true }))}
//               onOpenShifts={() => setState(prev => ({ ...prev, isOpenShiftsModalOpen: true }))}
//               onShiftSwaps={() => setState(prev => ({ ...prev, isShiftSwapsModalOpen: true }))}
//             />

//             {/* Schedule Grid */}
//             {state.loading.shifts ? (
//               <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-xs border border-gray-200">
//                 <Spin size="large" />
//               </div>
//             ) : (
//               <ScheduleGrid
//                 employees={filteredEmployees}
//                 daysInView={daysInView}
//                 shifts={displayedShifts}
//                 view={state.view}
//                 loading={state.loading.shifts}
//                 onAddShift={handleAddShift}
//                 onMoveShift={handleMoveShift}
//                 onSwapShifts={handleSwapShifts}
//                 onDeleteShift={handleDeleteShift}
//                 onEditShift={(shift) => {
//                   setState((prev) => ({
//                     ...prev,
//                     shiftToEdit: shift,
//                     newTime: {
//                       start: shift.start_time,
//                       end: shift.end_time,
//                     },
//                     isTimePickerModalOpen: true,
//                   }));
//                 }}
//                 getEmployeeFullName={getEmployeeFullName}
//               />
//             )}

//             {/* Modals */}
//             <EditShiftTimeModal
//               visible={state.isTimePickerModalOpen}
//               shift={state.shiftToEdit}
//               newTime={state.newTime}
//               error={state.error}
//               loading={state.loading.shifts}
//               onOk={handleUpdateShiftTime}
//               onCancel={() =>
//                 setState((prev) => ({
//                   ...prev,
//                   isTimePickerModalOpen: false,
//                   error: null,
//                 }))
//               }
//               onTimeChange={(type, value) =>
//                 setState((prev) => ({
//                   ...prev,
//                   newTime: { ...prev.newTime, [type]: value },
//                 }))
//               }
//             />

//             <AISchedulerModal
//               visible={state.isAISchedulerModalOpen}
//               onCancel={() => setState(prev => ({ ...prev, isAISchedulerModalOpen: false }))}
//               onGenerate={async (options) => {
//                 if (!token) return;

//                 setState(prev => ({ ...prev, loading: { ...prev.loading, aiScheduling: true } }));
//                 try {
//                   await generateAISchedule(options, token);
//                   showNotification("success", "AI Schedule Generated", "The schedule has been optimized based on your criteria");
//                   setState(prev => ({
//                     ...prev,
//                     isAISchedulerModalOpen: false,
//                     loading: { ...prev.loading, aiScheduling: false }
//                   }));
//                 } catch (error) {
//                   showNotification("error", "AI Scheduling Failed", "Failed to generate optimized schedule");
//                   setState(prev => ({
//                     ...prev,
//                     loading: { ...prev.loading, aiScheduling: false }
//                   }));
//                 }
//               }}
//               loading={state.loading.aiScheduling}
//             />

//             <OpenShiftsModal
//               visible={state.isOpenShiftsModalOpen}
//               openShifts={state.openShifts}
//               onClose={() => setState(prev => ({ ...prev, isOpenShiftsModalOpen: false }))}
//               onClaim={async (shiftId) => {
//                 showNotification("success", "Shift Claimed", "You have successfully claimed the shift");
//                 setState(prev => ({
//                   ...prev,
//                   openShifts: prev.openShifts.filter(s => s.id !== shiftId),
//                   isOpenShiftsModalOpen: false
//                 }));
//               }}
//             />

//             <ShiftSwapsModal
//               visible={state.isShiftSwapsModalOpen}
//               swapRequests={state.shiftSwapRequests}
//               employees={state.employees}
//               onClose={() => setState(prev => ({ ...prev, isShiftSwapsModalOpen: false }))}
//               onApprove={async (requestId) => {
//                 showNotification("success", "Request Approved", "Shift swap has been approved");
//                 setState(prev => ({
//                   ...prev,
//                   shiftSwapRequests: prev.shiftSwapRequests.map(r =>
//                     r.id === requestId ? { ...r, status: "approved" } : r
//                   )
//                 }));
//               }}
//               onReject={async (requestId) => {
//                 showNotification("info", "Request Rejected", "Shift swap has been rejected");
//                 setState(prev => ({
//                   ...prev,
//                   shiftSwapRequests: prev.shiftSwapRequests.map(r =>
//                     r.id === requestId ? { ...r, status: "rejected" } : r
//                   )
//                 }));
//               }}
//               getEmployeeFullName={getEmployeeFullName}
//             />
//           </div>
//         )}
//       </div>
//     </DndProvider>
//   );
// };

// export default SchedulerPage;
