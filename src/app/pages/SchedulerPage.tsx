/**
 * SchedulerPage.tsx - Production-level Shift Scheduling Component
 *
 * This component manages shift scheduling with drag & drop functionality, AI scheduling,
 * and comprehensive shift management features. It handles assigned shifts, unassigned shifts,
 * draft shifts, and provides real-time updates with optimistic UI patterns.
 *
 * Key Features:
 * - Drag & drop shift management
 * - Optimistic UI updates
 * - AI-powered scheduling
 * - Compliance monitoring
 * - Multi-view scheduling (day/week)
 * - Real-time shift operations
 *
 * Dependencies: react-dnd, antd, dayjs
 * API Integration: shifts, employees, clients
 *
 * @author Meron Seyoum
 * @version 2.0.0
 */

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Alert, Spin, notification } from "antd";
import dayjs, { Dayjs } from "dayjs";

// Day.js plugins - loaded before component logic
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";

// Extend dayjs with required plugins
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);

// Utility imports - drag & drop functionality
import {
  createOptimisticUpdater,
  canSwapShifts,
  getDropPreview,
  getShiftColumnId,
  trackDragOperation,
} from "@/lib/utils/dragDropUtils";

// UI Component imports - organized by feature

import { ComplianceWarnings } from "@/components/ui/shift/ComplianceWarnings";
import { ScheduleGrid } from "@/components/ui/shift/ScheduleGrid";
import { EditShiftTimeModal } from "@/components/ui/shift/EditShiftTimeModal";
import { ScheduleHeader } from "@/components/ui/shift/ScheduleHeader";
import { CreateShiftModal } from "@/components/ui/shift/CreateShiftModal";
import { Skeleton } from "@/components/ui/common/skeleton";

// Type imports - business logic types
import { Employee } from "@/lib/types/employee";
import { ComponentState, ScheduleTemplate, StatsData } from "@/lib/types/schedule";
import {
  ShiftWithEmployees,
  CreateShiftWithEmployeesDto,
  UpdateShiftDto,
  ShiftStatus,
} from "@/lib/types/shift";

// Service imports - API and authentication
import { useAuth } from "../../components/providers/AuthProvider";
import { api as apiCall } from "@/lib/api";
import { WeekCopyPasteModal } from "@/components/ui/shift/WeekCopyPasteModal";
import { ScheduleTemplateModal } from "@/components/ui/shift/ScheduleTemplateModal";
import { templateStorage, weekScheduleUtils } from "@/lib/utils/weekScheduleUtils";

// =====================================================
// CONSTANTS AND CONFIGURATION
// =====================================================

// =====================================================
// UTILITY FUNCTIONS (Pure functions, no side effects)
// =====================================================

/**
 * Checks shifts for compliance violations (overtime, break requirements, etc.)
 * @param shifts - Array of shifts to check
 * @returns Array of warning messages
 */
const checkCompliance = (shifts: ShiftWithEmployees[]): string[] => {
  const warnings: string[] = [];

  // Track employee hours and shifts for weekly limits and consecutive shifts
  const employeeShifts = new Map<
    number,
    { shifts: ShiftWithEmployees[]; totalHours: number }
  >();

  // Organize shifts by employee and date
  shifts.forEach((shift) => {
    shift.employees?.forEach((employeeShift) => {
      const employeeId = employeeShift.employee.id;
      if (!employeeShifts.has(employeeId)) {
        employeeShifts.set(employeeId, { shifts: [], totalHours: 0 });
      }

      const employeeData = employeeShifts.get(employeeId)!;
      employeeData.shifts.push(shift);

      // Calculate shift duration
      const start = dayjs(shift.start_time, "HH:mm");
      const end = dayjs(shift.end_time, "HH:mm");
      const duration = end.diff(start, "hours");
      employeeData.totalHours += duration;
    });
  });

  // Check each employee's shifts for compliance issues
  employeeShifts.forEach((employeeData, employeeId) => {
    const employee = employeeData.shifts[0]?.employees?.find(
      (e) => e.employee.id === employeeId
    )?.employee;
    const employeeName = employee
      ? `${employee.user.first_name} ${employee.user.last_name}`
      : "Unknown Employee";

    // Check weekly hour limits (40 hours per week)
    if (employeeData.totalHours > 40) {
      warnings.push(
        `Weekly hour limit exceeded for ${employeeName}: ${employeeData.totalHours} hours`
      );
    }

    // Check for overtime (more than 8 hours in a single shift)
    employeeData.shifts.forEach((shift) => {
      const start = dayjs(shift.start_time, "HH:mm");
      const end = dayjs(shift.end_time, "HH:mm");
      const duration = end.diff(start, "hours");

      if (duration > 8) {
        warnings.push(
          `Potential overtime for ${employeeName} on ${shift.date}: ${duration} hours`
        );
      }

      // Check break requirements (shifts longer than 6 hours need a 30-minute break)
      // if (duration > 6) {
      //   const hasBreak = shift.break_duration && shift.break_duration >= 30;
      //   if (!hasBreak) {
      //     warnings.push(`Break requirement not met for ${employeeName} on ${shift.date}: ${duration}-hour shift needs at least 30-minute break`);
      //   }
      // }
    });

    // Check for consecutive shift violations (less than 8 hours between shifts)
    const sortedShifts = [...employeeData.shifts].sort(
      (a, b) =>
        dayjs(a.date).diff(dayjs(b.date)) ||
        a.start_time.localeCompare(b.start_time)
    );

    for (let i = 0; i < sortedShifts.length - 1; i++) {
      const currentShift = sortedShifts[i];
      const nextShift = sortedShifts[i + 1];

      // Only check if shifts are on consecutive days
      if (dayjs(nextShift.date).diff(dayjs(currentShift.date), "day") === 1) {
        const currentEnd = dayjs(
          `${currentShift.date} ${currentShift.end_time}`
        );
        const nextStart = dayjs(`${nextShift.date} ${nextShift.start_time}`);
        const hoursBetween = nextStart.diff(currentEnd, "hours");

        if (hoursBetween < 8) {
          warnings.push(
            `Consecutive shift violation for ${employeeName}: Only ${hoursBetween} hours between shifts on ${currentShift.date} and ${nextShift.date}`
          );
        }
      }
    }
  });

  return warnings;
};

/**
 * Calculates scheduling statistics for dashboard display
 * @param shifts - Published shifts
 * @param draftShifts - Draft shifts
 * @param unassignedShifts - Unassigned shifts
 * @returns Calculated statistics object
 */
const calculateStats = (
  shifts: ShiftWithEmployees[],
  draftShifts: ShiftWithEmployees[],
  unassignedShifts: ShiftWithEmployees[]
): StatsData => {
  const totalShifts = shifts.length + draftShifts.length;

  // Calculate night shifts (10pm to 6am)
  const nightShifts = [...shifts, ...draftShifts].filter((shift) => {
    const startHour = parseInt(shift.start_time.split(":")[0]);
    return startHour >= 22 || startHour <= 6;
  }).length;

  // Calculate total and average hours
  const totalHours = [...shifts, ...draftShifts].reduce((sum, shift) => {
    const start = dayjs(shift.start_time, "HH:mm");
    const end = dayjs(shift.end_time, "HH:mm");
    return sum + end.diff(start, "hours");
  }, 0);

  const avgHours =
    totalShifts > 0 ? Math.round((totalHours / totalShifts) * 10) / 10 : 0;

  // Calculate workload balance score
  const employeeShiftCount = new Map<number, number>();
  shifts.forEach((shift) => {
    shift.employees?.forEach((empShift) => {
      const empId = empShift.employee.id;
      employeeShiftCount.set(empId, (employeeShiftCount.get(empId) || 0) + 1);
    });
  });

  const shiftCounts = Array.from(employeeShiftCount.values());
  const maxShifts = Math.max(...shiftCounts, 0);
  const minShifts = Math.min(...shiftCounts, maxShifts);
  const balanceScore =
    maxShifts > 0 ? Math.round((minShifts / maxShifts) * 100) : 100;

  return {
    totalShifts,
    nightShifts,
    avgHours,
    balanceScore,
    draftShifts: draftShifts.length,
    unassignedShifts: unassignedShifts.length,
  };
};

// =====================================================
// MAIN COMPONENT
// =====================================================

/**
 * SchedulerPage - Main scheduling interface component
 *
 * Manages the complete scheduling workflow including:
 * - Employee shift assignment
 * - Drag & drop operations
 * - Schedule publishing
 * - Compliance monitoring
 * - AI-powered optimization
 *
 * - handleCopyWeek
 * -handlePasteWeek
 * - handleSaveAsTemplate
 * - handleApplyTemplate
 * - handleDeleteTemplate
 * - loadTemplates
 */
export const SchedulerPage: React.FC = () => {
  // =====================================================
  // HOOKS AND REFS (Must be declared first)
  // =====================================================

  const { token } = useAuth();
  const [preLoading, setPreLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  // Refs for drag operations and cleanup
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =====================================================
  // COMPONENT STATE
  // =====================================================

  const [state, setState] = useState<ComponentState>({
    // Core data
    shifts: [],
    employees: [],
    clients: [],

    // UI state
    selectedLocation: null,
    dateRange: [dayjs().startOf("isoWeek"), dayjs().endOf("isoWeek")],
    view: "week",
    searchTerm: "",
    departmentFilter: "All",

    // Modal states
    isTimePickerModalOpen: false,
    isAISchedulerModalOpen: false,
    isOpenShiftsModalOpen: false,
    isShiftSwapsModalOpen: false,
    isCreateShiftModalVisible: false,
    isCreateUnassignedModal: false,

    // Edit states
    shiftToEdit: null,
    newTime: { start: "8:00", end: "16:00" },
    selectedDateForModal: undefined,
    selectedEmployeeForModal: undefined,

    // System state
    error: null,
    loading: {
      shifts: false,
      employees: false,
      clients: false,
      general: false,
      aiScheduling: false,
      publishing: false,
    },

    // Feature data
    openShifts: [],
    shiftSwapRequests: [],
    complianceWarnings: [],
    unassignedShifts: [],
    draftShifts: [],

    // UI preferences
    sidebarCollapsed: false,
    selectedNavKey: "schedule",
    showStatsDashboard: false,
    selectedShiftTime: { start: "8:00", end: "16:00" },
    showShiftTimeSelector: false,

    // Enhanced drag & drop state
    dragState: {
      isDragging: false,
      draggedShift: null,
      dropPreview: null,
    },
    optimisticUpdates: {
      pendingMoves: new Map(),
      pendingSwaps: new Map(),
      pendingDeletes: new Set(),
    },
    copiedWeekSchedule: null,
    scheduleTemplates: [],
    isCopyWeekModalVisible: false,
    isTemplateModalVisible: false,
    templateName: "",
    templateDescription: "",
  });

  const optimisticUpdateRef = useRef(createOptimisticUpdater(setState));

  // =====================================================
  // MEMOIZED VALUES (Computed before callback functions)
  // =====================================================

  // Memoized debounced drag handler

  /**
   * Get formatted employee full name
   */
  const getEmployeeFullName = useCallback((employee: Employee): string => {
    // Check if names are nested under user object
    const firstName = employee.user?.first_name || employee.first_name || "";
    const lastName = employee.user?.last_name || employee.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Unknown Employee";
  }, []);

  // Filtered employees based on location, search, and department
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

  // Shifts filtered for current view and date range
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

  // Days to display in current view
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

  // Calculate statistics for dashboard
  const stats = useMemo(
    () =>
      calculateStats(
        displayedShifts,
        state.draftShifts,
        state.unassignedShifts
      ),
    [displayedShifts, state.draftShifts, state.unassignedShifts]
  );

  // =====================================================
  // UTILITY CALLBACK FUNCTIONS
  // =====================================================

  /**
   * Display notification with consistent styling
   */
  const showNotification = useCallback(
    (
      type: "success" | "info" | "warning" | "error",
      message: string,
      description: string
    ) => {
      api[type]({
        message,
        description,
        placement: "topRight",
        duration: type === "error" ? 5 : 3,
      });
    },
    [api]
  );

  // =====================================================
  // API FUNCTIONS (Data fetching and persistence)
  // =====================================================

  /**
   * Fetches shift data from API based on current filters
   * Called when date range or location changes
   */
  const fetchShiftsData = useCallback(async () => {
    if (!token || !state.selectedLocation) return;

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
  }, [token, state.selectedLocation, state.dateRange]);

  // =====================================================
  // DRAG & DROP HANDLERS (Core scheduling operations)
  // =====================================================

  /**
   * Handles moving a shift to a new employee/date
   * Includes optimistic updates and proper error handling
   */
  const handleMoveShift = useCallback(
    async (shift: ShiftWithEmployees, employeeId: number, date: string) => {
      if (!token) return;

      const sourceColumn = getShiftColumnId(shift);
      const targetColumn = getShiftColumnId(shift, employeeId, date);
      trackDragOperation("move", sourceColumn, targetColumn, shift.id);

      console.log(
        `Moving shift ${shift.id} from ${sourceColumn} to ${targetColumn}`
      );

      // Validate the move operation
      const preview = getDropPreview(
        { type: "shift", shift, originalColumn: sourceColumn },
        employeeId,
        date,
        undefined,
        state.employees
      );

      if (!preview.isValid) {
        showNotification("warning", "Invalid Move", preview.message);
        return;
      }

      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: true },
        }));

        const isUnassignedShift = shift.employees.length === 0;

        if (isUnassignedShift) {
          // Handle unassigned shift assignment
          const createShiftDto: CreateShiftWithEmployeesDto = {
            client_id: shift.client_id.toString(),
            date: date,
            start_time: shift.start_time,
            end_time: shift.end_time,
            employee_ids: [employeeId],
            shift_type: shift.shift_type || "regular",
            notes: shift.notes,
          };

          await apiCall.shifts.createShift(createShiftDto, token);
        } else {
          // Handle moving an existing assigned shift
          const currentEmployeeId = shift.employees[0]?.employee.id;
          if (!currentEmployeeId)
            throw new Error("Shift has no assigned employee");

          await apiCall.shifts.moveShiftToDate(
            shift.id,
            date,
            employeeId,
            token
          );
        }

        // Refresh data from API to ensure consistency
        await fetchShiftsData();

        showNotification(
          "success",
          isUnassignedShift ? "Shift Assigned" : "Shift Moved",
          isUnassignedShift
            ? "Unassigned shift has been successfully assigned to employee"
            : "Shift was successfully moved to new employee/date"
        );
      } catch (error) {
        console.error("Move shift failed:", error);
        showNotification(
          "error",
          "Move Failed",
          error instanceof Error ? error.message : "Failed to move shift"
        );
      } finally {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: false },
        }));
      }
    },
    [token, state.employees, showNotification, fetchShiftsData]
  );

  /**
   * Handles swapping two shifts with optimistic updates
   * Provides immediate feedback while API call is in progress
   */
  const handleSwapShifts = useCallback(
    async (
      targetShift: ShiftWithEmployees,
      sourceShift: ShiftWithEmployees
    ) => {
      if (!token) return;

      console.log(
        `Optimistic swap: Shifts ${sourceShift.id} and ${targetShift.id}`
      );

      // Validate swap operation
      if (!canSwapShifts(sourceShift, targetShift)) {
        showNotification(
          "warning",
          "Invalid Swap",
          "These shifts cannot be swapped"
        );
        return;
      }

      const swapId = `${sourceShift.id}-${targetShift.id}`;

      // Define optimistic update function
      const optimisticUpdate = (prevState: ComponentState) => {
        const sourceEmployee = sourceShift.employees[0]?.employee;
        const targetEmployee = targetShift.employees[0]?.employee;

        return {
          ...prevState,
          shifts: prevState.shifts.map((s) => {
            if (s.id === sourceShift.id) {
              return {
                ...s,
                date: targetShift.date,
                employees: [
                  {
                    ...s.employees[0],
                    employee: targetEmployee,
                  },
                ],
              };
            }
            if (s.id === targetShift.id) {
              return {
                ...s,
                date: sourceShift.date,
                employees: [
                  {
                    ...s.employees[0],
                    employee: sourceEmployee,
                  },
                ],
              };
            }
            return s;
          }),
          optimisticUpdates: {
            ...prevState.optimisticUpdates,
            pendingSwaps: new Map(prevState.optimisticUpdates.pendingSwaps).set(
              swapId,
              {
                shift1: sourceShift,
                shift2: targetShift,
              }
            ),
          },
        };
      };

      // Define rollback function for error handling
      const rollbackUpdate = (prevState: ComponentState) => ({
        ...prevState,
        shifts: prevState.shifts.map((s) => {
          if (s.id === sourceShift.id) return sourceShift;
          if (s.id === targetShift.id) return targetShift;
          return s;
        }),
        optimisticUpdates: {
          ...prevState.optimisticUpdates,
          pendingSwaps: new Map(
            [...prevState.optimisticUpdates.pendingSwaps].filter(
              ([key]) => key !== swapId
            )
          ),
        },
      });

      // Define async operation
      const asyncOperation = async () => {
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

          // Execute swap operations in parallel
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

          // Update state with API results
          setState((prev) => ({
            ...prev,
            shifts: prev.shifts
              .filter((s) => s.id !== sourceShift.id && s.id !== targetShift.id)
              .concat(updatedShifts),
            loading: { ...prev.loading, shifts: false },
            error: null,
            optimisticUpdates: {
              ...prev.optimisticUpdates,
              pendingSwaps: new Map(
                [...prev.optimisticUpdates.pendingSwaps].filter(
                  ([key]) => key !== swapId
                )
              ),
            },
          }));

          showNotification(
            "success",
            "Shifts Swapped",
            "Shifts were successfully swapped"
          );
        } catch (error) {
          setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, shifts: false },
          }));
          throw error;
        }
      };

      return optimisticUpdateRef.current(
        optimisticUpdate,
        asyncOperation,
        rollbackUpdate
      );
    },
    [token, showNotification]
  );

  /**
   * Handles deleting a single shift (FIXED: now deletes individual shift, not entire column)
   * Includes optimistic updates and proper error handling
   */
  const handleDeleteShift = useCallback(
    async (shiftId: number) => {
      if (!token) return;

      // Find the specific shift to delete across all shift arrays
      const shiftToDelete = [
        ...state.shifts,
        ...state.draftShifts,
        ...state.unassignedShifts,
      ].find((s) => s.id === shiftId);

      if (!shiftToDelete) {
        showNotification("error", "Error", "Shift not found");
        return;
      }

      console.log(
        `Deleting individual shift ${shiftId} for employee ${
          shiftToDelete.employees[0]?.employee?.id || "unassigned"
        } on ${shiftToDelete.date}`
      );

      // Define optimistic update to remove only the specific shift
      const optimisticUpdate = (prevState: ComponentState) => ({
        ...prevState,
        shifts: prevState.shifts.filter((s) => s.id !== shiftId),
        draftShifts: prevState.draftShifts.filter((s) => s.id !== shiftId),
        unassignedShifts: prevState.unassignedShifts.filter(
          (s) => s.id !== shiftId
        ),
        optimisticUpdates: {
          ...prevState.optimisticUpdates,
          pendingDeletes: new Set([
            ...prevState.optimisticUpdates.pendingDeletes,
            shiftId,
          ]),
        },
      });

      // Define rollback function to restore the specific shift
      const rollbackUpdate = (prevState: ComponentState) => {
        const newState = { ...prevState };

        // Restore the shift to its original location based on its properties
        if (shiftToDelete.employees.length > 0) {
          newState.shifts = [...prevState.shifts, shiftToDelete];
        } else if (shiftToDelete.status === "draft") {
          newState.draftShifts = [...prevState.draftShifts, shiftToDelete];
        } else {
          newState.unassignedShifts = [
            ...prevState.unassignedShifts,
            shiftToDelete,
          ];
        }

        newState.optimisticUpdates = {
          ...prevState.optimisticUpdates,
          pendingDeletes: new Set(
            [...prevState.optimisticUpdates.pendingDeletes].filter(
              (id) => id !== shiftId
            )
          ),
        };

        return newState;
      };

      // Define async delete operation
      const asyncOperation = async () => {
        try {
          setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, shifts: true },
          }));

          // Call API to delete the specific shift
          await apiCall.shifts.deleteShift(shiftId, token);

          setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, shifts: false },
            optimisticUpdates: {
              ...prev.optimisticUpdates,
              pendingDeletes: new Set(
                [...prev.optimisticUpdates.pendingDeletes].filter(
                  (id) => id !== shiftId
                )
              ),
            },
          }));

          showNotification(
            "success",
            "Shift Deleted",
            "The shift was successfully deleted"
          );
        } catch (error) {
          setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, shifts: false },
          }));
          throw error;
        }
      };

      return optimisticUpdateRef.current(
        optimisticUpdate,
        asyncOperation,
        rollbackUpdate
      );
    },
    [
      token,
      state.shifts,
      state.draftShifts,
      state.unassignedShifts,
      showNotification,
    ]
  );

  // =====================================================
  // SHIFT CREATION HANDLERS
  // =====================================================

  /**
   * Opens create shift modal for new unassigned shift
   */
  // For the "New Shift" button in header - no specific employee
  const handleCreateNewShift = useCallback(
    (date?: string, isUnassigned: boolean = false) => {
      setState((prev) => ({
        ...prev,
        isCreateShiftModalVisible: true,
        isCreateUnassignedModal: isUnassigned,
        selectedDateForModal: date,
        selectedEmployeeForModal: undefined, // Explicitly undefined
      }));
    },
    []
  );

  /**
   * Opens create shift modal for specific employee and date
   */
  const handleAddShift = useCallback((employeeId: number, date: string) => {
    setState((prev) => ({
      ...prev,
      isCreateShiftModalVisible: true,
      isCreateUnassignedModal: false,
      selectedDateForModal: date,
      selectedEmployeeForModal: employeeId,
    }));
  }, []);


  /**
   * Handles saving new shift - supports both assigned and unassigned shifts
   */

  const handleSaveShift = useCallback(
    async (shiftData: any) => {
      if (!token || !state.selectedLocation) {
        showNotification(
          "error",
          "Error",
          "Authentication or location required"
        );
        return;
      }

      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: true },
        }));

        // Case 1: Unassigned shift (keep original logic - only update state)
        if (state.isCreateUnassignedModal) {
          console.log("Creating unassigned shift (local state only)");

          const selectedClient = state.clients.find(
            (c) => c.id === parseInt(state.selectedLocation!.id)
          );
          if (!selectedClient) throw new Error("Client not found");

          const newUnassignedShift: ShiftWithEmployees = {
            id: Date.now(), // Temporary ID for local state
            date: shiftData.date,
            start_time: shiftData.startTime,
            end_time: shiftData.endTime,
            break_duration: shiftData.breakDuration,
            client_id: parseInt(state.selectedLocation!.id),
            client: {
              id: selectedClient.id,
              business_name: selectedClient.business_name,
              email: selectedClient.email || "",
              phone: selectedClient.phone || "",
              contact_person: selectedClient.contact_person || "",
              location_address: selectedClient.location_address || {
                city: "",
                state: "",
                street: "",
                country: "",
                postal_code: "",
              },
              status: selectedClient.status || "active",
              notes: selectedClient.notes || null,
            },
            employees: [],
            shift_type: "regular",
            notes: shiftData.note,
            status: (shiftData.publish ? "scheduled" : "draft") as ShiftStatus,
            name: shiftData.name || `Unassigned Shift ${Date.now()}`,
            created_at: dayjs().format(),
            updated_at: dayjs().format(),
            created_by: 1,
          };

          if (shiftData.publish) {
            setState((prev) => ({
              ...prev,
              unassignedShifts: [...prev.unassignedShifts, newUnassignedShift],
            }));
          } else {
            setState((prev) => ({
              ...prev,
              draftShifts: [...prev.draftShifts, newUnassignedShift],
            }));
          }
        }
        // Case 2: Assigned shift with specific employee (from grid click) - use API
        else if (state.selectedEmployeeForModal) {
          console.log(
            "Creating assigned shift for specific employee via API:",
            state.selectedEmployeeForModal
          );

          const employee = state.employees.find(
            (e) => e.id === state.selectedEmployeeForModal
          );
          if (!employee) throw new Error("Employee not found");

          const createShiftDto: CreateShiftWithEmployeesDto = {
            client_id: state.selectedLocation!.id.toString(),
            date: shiftData.date,
            start_time: shiftData.startTime,
            end_time: shiftData.endTime,
            employee_ids: [employee.id],
            shift_type: "regular",
            notes: shiftData.note,
            // status: shiftData.publish ? 'scheduled' : 'draft' as ShiftStatus,
          };

          const response = await apiCall.shifts.createShift(
            createShiftDto,
            token
          );

          let newShift: ShiftWithEmployees;
          if (response.shift) {
            newShift = response.shift;
          } else if ((response as unknown as ShiftWithEmployees).id) {
            newShift = response as unknown as ShiftWithEmployees;
          } else {
            throw new Error("Invalid API response format");
          }

          if (shiftData.publish) {
            setState((prev) => ({
              ...prev,
              shifts: [...prev.shifts, newShift],
            }));
          } else {
            const draftShift: ShiftWithEmployees = {
              ...newShift,
              status: "draft" as ShiftStatus,
              employees: newShift.employees
                ? newShift.employees.map((emp: any) => ({
                    ...emp,
                    status: "scheduled" as ShiftStatus,
                  }))
                : [],
            };

            setState((prev) => ({
              ...prev,
              draftShifts: [...prev.draftShifts, draftShift],
            }));
          }
        }
        // Case 3: Assigned shift without specific employee (from header - user selects from dropdown) - use API
        else if (shiftData.employee) {
          console.log(
            "Creating shift with employee selected from dropdown via API:",
            shiftData.employee
          );

          const employee = state.employees.find(
            (e) => e.id === parseInt(shiftData.employee)
          );
          if (!employee) throw new Error("Employee not found");

          const createShiftDto: CreateShiftWithEmployeesDto = {
            client_id: state.selectedLocation!.id.toString(),
            date: shiftData.date,
            start_time: shiftData.startTime,
            end_time: shiftData.endTime,
            employee_ids: [employee.id],
            shift_type: "regular",
            notes: shiftData.note,
            // status: shiftData.publish ? 'scheduled' : 'draft' as ShiftStatus,
          };

          const response = await apiCall.shifts.createShift(
            createShiftDto,
            token
          );

          let newShift: ShiftWithEmployees;
          if (response.shift) {
            newShift = response.shift;
          } else if ((response as unknown as ShiftWithEmployees).id) {
            newShift = response as unknown as ShiftWithEmployees;
          } else {
            throw new Error("Invalid API response format");
          }

          if (shiftData.publish) {
            setState((prev) => ({
              ...prev,
              shifts: [...prev.shifts, newShift],
            }));
          } else {
            const draftShift: ShiftWithEmployees = {
              ...newShift,
              status: "draft" as ShiftStatus,
              employees: newShift.employees
                ? newShift.employees.map((emp: any) => ({
                    ...emp,
                    status: "scheduled" as ShiftStatus,
                  }))
                : [],
            };

            setState((prev) => ({
              ...prev,
              draftShifts: [...prev.draftShifts, draftShift],
            }));
          }
        }
        // Case 4: No employee selected at all
        else {
          throw new Error("Please select an employee for this shift");
        }

        showNotification(
          "success",
          "Shift Created",
          "Shift was successfully created"
        );
      } catch (error) {
        console.error("Failed to create shift:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create shift";
        showNotification("error", "Create Shift Failed", errorMessage);
      } finally {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: false },
          isCreateShiftModalVisible: false,
        }));
      }
    },
    [
      token,
      state.selectedLocation,
      state.employees,
      state.clients,
      state.isCreateUnassignedModal,
      state.selectedEmployeeForModal,
      showNotification,
    ]
  );
  // =====================================================
  // SCHEDULE MANAGEMENT HANDLERS
  // =====================================================

  /**
   * Publishes all draft shifts to make them official
   */
  const handlePublishSchedule = useCallback(async () => {
    if (!token || !state.selectedLocation) {
      showNotification("error", "Error", "Authentication or location required");
      return;
    }
    try {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, publishing: true },
      }));

      const publishPromises = state.draftShifts.map(async (draftShift) => {
        const updatedShift = await apiCall.shifts.updateShift(
          draftShift.id,
          {
            status: "scheduled",
          },
          token
        );
        return updatedShift;
      });

      const publishedShifts = await Promise.all(publishPromises);

      setState((prev) => ({
        ...prev,
        shifts: [
          ...prev.shifts,
          ...publishedShifts.filter((s) => s.employees.length > 0),
        ],
        unassignedShifts: [
          ...prev.unassignedShifts,
          ...publishedShifts.filter((s) => s.employees.length === 0),
        ],
        draftShifts: [],
        loading: { ...prev.loading, publishing: false },
      }));

      showNotification(
        "success",
        "Schedule Published",
        "All draft shifts have been published"
      );
    } catch (error) {
      console.error("Failed to publish schedule:", error);
      showNotification("error", "Publish Failed", "Failed to publish schedule");
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, publishing: false },
      }));
    }
  }, [token, state.draftShifts, showNotification]);

  /**
   * Updates shift times for existing shift
   */
  const handleUpdateShiftTime = useCallback(async () => {
    if (!state.shiftToEdit || !token) return;

    const formattedStart = state.newTime.start.split(":").slice(0, 2).join(":");
    const formattedEnd = state.newTime.end.split(":").slice(0, 2).join(":");

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

  // =====================================================
  // NAVIGATION HANDLERS
  // =====================================================

  /**
   * Navigate to previous week
   */
  const handlePrevious = useCallback(() => {
    const newStart = state.dateRange[0].subtract(1, "week").startOf("isoWeek");
    setState((prev) => ({
      ...prev,
      dateRange: [newStart, newStart.endOf("isoWeek")],
    }));
  }, [state.dateRange]);

  /**
   * Navigate to next week
   */
  const handleNext = useCallback(() => {
    const newStart = state.dateRange[0].add(1, "week").startOf("isoWeek");
    setState((prev) => ({
      ...prev,
      dateRange: [newStart, newStart.endOf("isoWeek")],
    }));
  }, [state.dateRange]);

  /**
   * Navigate to current week
   */
  const handleToday = useCallback(() => {
    const newStart = dayjs().startOf("isoWeek");
    setState((prev) => ({
      ...prev,
      dateRange: [newStart, newStart.endOf("isoWeek")],
    }));
  }, []);

  /**
   * Handle manual date range changes
   */
  const handleDateRangeChange = useCallback((range: [Dayjs, Dayjs]) => {
    setState((prev) => ({
      ...prev,
      dateRange: range,
    }));
  }, []);

  /**
   * Undo last changes by refetching data
   */
  const handleUndoChanges = useCallback(() => {
    if (state.selectedLocation) fetchShiftsData();
    showNotification(
      "info",
      "Changes Undone",
      "The last action has been undone"
    );
  }, [state.selectedLocation, showNotification, fetchShiftsData]);

  // =====================================================
  // Copy paste and template functions
  // =====================================================

  /**
   * Copy current week schedule to clipboard
   */
  const handleCopyWeek = useCallback(() => {
    if (!state.selectedLocation) {
      showNotification(
        "warning",
        "No Location",
        "Please select a location first"
      );
      return;
    }

    if (
      displayedShifts.length === 0 &&
      state.draftShifts.length === 0 &&
      state.unassignedShifts.length === 0
    ) {
      showNotification(
        "info",
        "No Shifts",
        "No shifts to copy in current week"
      );
      return;
    }

    const weekSchedule = weekScheduleUtils.extractWeekSchedule(
      displayedShifts,
      state.draftShifts,
      state.unassignedShifts,
      state.dateRange[0],
      state.selectedLocation.id,
      state.selectedLocation.name
    );

    setState((prev) => ({
      ...prev,
      copiedWeekSchedule: weekSchedule,
    }));

    const weekRange = weekScheduleUtils.formatWeekRange(weekSchedule.weekStart);
    showNotification(
      "success",
      "Week Copied",
      `Copied ${weekSchedule.metadata.totalShifts} shifts from ${weekRange}`
    );
  }, [
    displayedShifts,
    state.draftShifts,
    state.unassignedShifts,
    state.selectedLocation,
    state.dateRange,
    showNotification,
  ]);

  /**
   * Paste copied week to current or selected week
   */
  /**
 * Paste copied week to current or selected week
 */
const handlePasteWeek = useCallback(
  async (targetWeekStart?: Dayjs) => {
    if (!state.copiedWeekSchedule || !token || !state.selectedLocation) {
      showNotification(
        "warning",
        "Cannot Paste",
        "No copied week data available"
      );
      return;
    }

    const targetWeek = targetWeekStart || state.dateRange[0];
    const sourceWeekStart = dayjs(state.copiedWeekSchedule.weekStart);

    // Validate the operation
    const validation = weekScheduleUtils.validateWeekCopy(
      state.copiedWeekSchedule,
      targetWeek,
      state.employees
    );

    if (!validation.isValid) {
      showNotification(
        "error",
        "Cannot Paste Week",
        validation.errors.join(". ")
      );
      return;
    }

    if (validation.warnings.length > 0) {
      console.warn("Week paste warnings:", validation.warnings);
    }

    try {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, shifts: true },
      }));

      // Helper function to format time to HH:mm
      const formatTimeForAPI = (time: string) => {
        if (!time) return '';
        return time.replace(/:\d{2}$/, '');
      };

      // Transform shifts to target week
      const transformedShifts = weekScheduleUtils.transformShiftsToTargetWeek(
        state.copiedWeekSchedule.shifts,
        sourceWeekStart,
        targetWeek
      );

      // Separate assigned and unassigned shifts
      const assignedShifts = transformedShifts.filter(
        (shift) => !shift.isUnassigned
      );
      const unassignedShifts = transformedShifts.filter(
        (shift) => shift.isUnassigned
      );

      let createdCount = 0;

      // Create assigned shifts via API
      for (const shiftData of assignedShifts) {
        try {
          const createDto: CreateShiftWithEmployeesDto = {
            client_id: state.selectedLocation.id.toString(),
            date: shiftData.date,
            start_time: formatTimeForAPI(shiftData.start_time),
            end_time: formatTimeForAPI(shiftData.end_time),
            employee_ids: shiftData.employee_ids,
            shift_type: shiftData.shift_type,
            notes: shiftData.notes,
          };

          await apiCall.shifts.createShift(createDto, token);
          createdCount++;
        } catch (error) {
          console.error(
            `Failed to create shift for ${shiftData.date}:`,
            error
          );
          // Continue with other shifts
        }
      }

      // Handle unassigned shifts by updating local state
      const newUnassignedShifts = unassignedShifts.map((shiftData) => {
        const selectedClient = state.clients.find(
          (c) => c.id === parseInt(state.selectedLocation!.id)
        );

        const newShift: ShiftWithEmployees = {
          id: Date.now() + Math.random(), // Temporary ID
          date: shiftData.date,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          break_duration: shiftData.originalShift.break_duration,
          client_id: parseInt(state.selectedLocation!.id),
          client: selectedClient
            ? {
                id: selectedClient.id,
                business_name: selectedClient.business_name,
                email: selectedClient.email || "",
                phone: selectedClient.phone || "",
                contact_person: selectedClient.contact_person || "",
                location_address: selectedClient.location_address || {
                  city: "",
                  state: "",
                  street: "",
                  country: "",
                  postal_code: "",
                },
                status: selectedClient.status || "active",
                notes: selectedClient.notes || null,
              }
            : ({} as any),
          employees: [],
          shift_type: shiftData.shift_type || "regular",
          notes: shiftData.notes,
          status: shiftData.originalShift.status,
          name: shiftData.originalShift.name || `Unassigned Shift`,
          created_at: dayjs().format(),
          updated_at: dayjs().format(),
          created_by: 1,
        };

        return newShift;
      });

      // Update state with new unassigned shifts
      if (newUnassignedShifts.length > 0) {
        setState((prev) => ({
          ...prev,
          unassignedShifts: [
            ...prev.unassignedShifts,
            ...newUnassignedShifts,
          ],
        }));
      }

      // Refresh assigned shifts from API
      await fetchShiftsData();

      const targetWeekRange = weekScheduleUtils.formatWeekRange(
        targetWeek.format("YYYY-MM-DD")
      );
      const totalCreated = createdCount + newUnassignedShifts.length;

      showNotification(
        "success",
        "Week Pasted",
        `Successfully pasted ${totalCreated} shifts to ${targetWeekRange}`
      );
    } catch (error) {
      console.error("Paste week failed:", error);
      showNotification(
        "error",
        "Paste Failed",
        error instanceof Error
          ? error.message
          : "Failed to paste week schedule"
      );
    } finally {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, shifts: false },
      }));
    }
  },
  [
    state.copiedWeekSchedule,
    state.selectedLocation,
    state.employees,
    state.dateRange,
    state.clients,
    state.unassignedShifts,
    token,
    fetchShiftsData,
    showNotification,
  ]
);

/**
 * Apply template to current or specified week
 */

const handleApplyTemplate = useCallback(
  async (templateId: string, targetWeekStart?: Dayjs) => {
    const template = state.scheduleTemplates.find((t) => t.id === templateId);

    if (!template || !token || !state.selectedLocation) {
      showNotification(
        "warning",
        "Cannot Apply",
        "Template not found or location not selected"
      );
      return;
    }

    const targetWeek = targetWeekStart || state.dateRange[0];
    const sourceWeekStart = dayjs(template.weekSchedule.weekStart);

    // Validate template application
    const validation = weekScheduleUtils.validateWeekCopy(
      template.weekSchedule,
      targetWeek,
      state.employees
    );

    if (!validation.isValid) {
      showNotification(
        "error",
        "Cannot Apply Template",
        validation.errors.join(". ")
      );
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, shifts: true },
      }));

      // Helper function to format time to HH:mm
      const formatTimeForAPI = (time: string) => {
        if (!time) return '';
        return time.replace(/:\d{2}$/, '');
      };

      // Transform template shifts to target week
      const transformedShifts = weekScheduleUtils.transformShiftsToTargetWeek(
        template.weekSchedule.shifts,
        sourceWeekStart,
        targetWeek
      );

      // Process shifts similar to paste operation
      const assignedShifts = transformedShifts.filter(
        (shift) => !shift.isUnassigned
      );
      const unassignedShifts = transformedShifts.filter(
        (shift) => shift.isUnassigned
      );

      let createdCount = 0;

      // Create assigned shifts
      for (const shiftData of assignedShifts) {
        try {
          const createDto: CreateShiftWithEmployeesDto = {
            client_id: state.selectedLocation.id.toString(),
            date: shiftData.date,
            start_time: formatTimeForAPI(shiftData.start_time),
            end_time: formatTimeForAPI(shiftData.end_time),
            employee_ids: shiftData.employee_ids,
            shift_type: shiftData.shift_type,
            notes: shiftData.notes,
          };

          await apiCall.shifts.createShift(createDto, token);
          createdCount++;
        } catch (error) {
          console.error(`Failed to create shift from template:`, error);
        }
      }

      // Handle unassigned shifts
      const newUnassignedShifts = unassignedShifts.map((shiftData) => {
        const selectedClient = state.clients.find(
          (c) => c.id === parseInt(state.selectedLocation!.id)
        );

        return {
          id: Date.now() + Math.random(),
          date: shiftData.date,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          break_duration: shiftData.originalShift.break_duration,
          client_id: parseInt(state.selectedLocation!.id),
          client: selectedClient
            ? {
                id: selectedClient.id,
                business_name: selectedClient.business_name,
                email: selectedClient.email || "",
                phone: selectedClient.phone || "",
                contact_person: selectedClient.contact_person || "",
                location_address: selectedClient.location_address || {
                  city: "",
                  state: "",
                  street: "",
                  country: "",
                  postal_code: "",
                },
                status: selectedClient.status || "active",
                notes: selectedClient.notes || null,
              }
            : ({} as any),
          employees: [],
          shift_type: shiftData.shift_type || "regular",
          notes: shiftData.notes,
          status: shiftData.originalShift.status,
          name: shiftData.originalShift.name || "Template Shift",
          created_at: dayjs().format(),
          updated_at: dayjs().format(),
          created_by: 1,
        } as ShiftWithEmployees;
      });

      if (newUnassignedShifts.length > 0) {
        setState((prev) => ({
          ...prev,
          unassignedShifts: [
            ...prev.unassignedShifts,
            ...newUnassignedShifts,
          ],
        }));
      }

      await fetchShiftsData();

      const targetWeekRange = weekScheduleUtils.formatWeekRange(
        targetWeek.format("YYYY-MM-DD")
      );
      const totalCreated = createdCount + newUnassignedShifts.length;

      showNotification(
        "success",
        "Template Applied",
        `Applied "${template.name}" - created ${totalCreated} shifts for ${targetWeekRange}`
      );
    } catch (error) {
      console.error("Apply template failed:", error);
      showNotification("error", "Apply Failed", "Failed to apply template");
    } finally {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, shifts: false },
      }));
    }
  },
  [
    state.scheduleTemplates,
    state.selectedLocation,
    state.dateRange,
    state.employees,
    state.clients,
    state.unassignedShifts,
    token,
    fetchShiftsData,
    showNotification,
  ]
);

  /**
   * Save current week as a template
   */
  const handleSaveAsTemplate = useCallback(
    async (templateName: string, description?: string) => {
      if (!state.selectedLocation) {
        showNotification(
          "warning",
          "No Location",
          "Please select a location first"
        );
        return;
      }

      if (
        displayedShifts.length === 0 &&
        state.draftShifts.length === 0 &&
        state.unassignedShifts.length === 0
      ) {
        showNotification("info", "No Shifts", "No shifts to save as template");
        return;
      }

      const weekSchedule = weekScheduleUtils.extractWeekSchedule(
        displayedShifts,
        state.draftShifts,
        state.unassignedShifts,
        state.dateRange[0],
        state.selectedLocation.id,
        state.selectedLocation.name
      );

      const template: ScheduleTemplate = {
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: templateName,
        description,
        weekSchedule,
        createdAt: dayjs().toISOString(),
        updatedAt: dayjs().toISOString(),
        createdBy: 1, // Replace with actual user ID from auth
        tags: [state.selectedLocation.name, "custom"],
      };

      try {
        // Save to storage (replace with API call when ready)
        templateStorage.saveTemplate(template);

        setState((prev) => ({
          ...prev,
          scheduleTemplates: [...prev.scheduleTemplates, template],
          isTemplateModalVisible: false,
          templateName: "",
          templateDescription: "",
        }));

        showNotification(
          "success",
          "Template Saved",
          `Template "${templateName}" saved successfully with ${template.weekSchedule.metadata.totalShifts} shifts`
        );
      } catch (error) {
        console.error("Save template failed:", error);
        showNotification("error", "Save Failed", "Failed to save template");
      }
    },
    [
      displayedShifts,
      state.draftShifts,
      state.unassignedShifts,
      state.selectedLocation,
      state.dateRange,
      showNotification,
    ]
  );

 


  /**
   * Delete template
   */
  const handleDeleteTemplate = useCallback(
    (templateId: string) => {
      try {
        templateStorage.deleteTemplate(templateId);

        setState((prev) => ({
          ...prev,
          scheduleTemplates: prev.scheduleTemplates.filter(
            (t) => t.id !== templateId
          ),
        }));

        showNotification(
          "success",
          "Template Deleted",
          "Template removed successfully"
        );
      } catch (error) {
        console.error("Delete template failed:", error);
        showNotification("error", "Delete Failed", "Failed to delete template");
      }
    },
    [showNotification]
  );

  /**
   * Load templates from storage on component mount
   */
  const loadTemplates = useCallback(async () => {
    try {
      const templates = templateStorage.getTemplates();
      setState((prev) => ({
        ...prev,
        scheduleTemplates: templates,
      }));
    } catch (error) {
      console.error("Load templates failed:", error);
    }
  }, []);

  // =====================================================
  // EFFECT HOOKS (Side effects and lifecycle)
  // =====================================================

  /**
   * Initial data loading effect
   * Fetches clients and employees on component mount
   */
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

  /**
   * Shifts data loading effect
   * Fetches shifts when location or date range changes
   */
  useEffect(() => {
    fetchShiftsData();
  }, [fetchShiftsData]);

  /**
   * Compliance checking effect
   * Updates compliance warnings when shifts change
   */
  useEffect(() => {
    if (state.shifts.length > 0) {
      const warnings = checkCompliance(state.shifts);
      setState((prev) => ({ ...prev, complianceWarnings: warnings }));
    }
  }, [state.shifts]);

  /**
   * Cleanup effect
   * Clears timers and pending operations on unmount
   */
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      // Clear any pending optimistic updates
      setState((prev) => ({
        ...prev,
        optimisticUpdates: {
          pendingMoves: new Map(),
          pendingSwaps: new Map(),
          pendingDeletes: new Set(),
        },
      }));
    };
  }, []);

  /**
   * Load templates effect
   * Load saved templates on component mount
   */
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // =====================================================
  // RENDER LOGIC
  // =====================================================

  // Early return for location selection
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen">
        {contextHolder}
        <div>
          <div className="overflow-auto">
            {preLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="mx-auto">
                {/* Schedule Header - Navigation and Controls */}
                <ScheduleHeader
                  dateRange={state.dateRange}
                  clients={state.clients}
                  selectedLocation={state.selectedLocation}
                  departmentFilter={state.departmentFilter}
                  searchTerm={state.searchTerm}
                  view={state.view}
                  loading={state.loading}
                  stats={stats}
                  onLocationChange={(locationId) => {
                    const client = state.clients.find(
                      (c) => c.id.toString() === locationId
                    );
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
                  onDepartmentChange={(value) =>
                    setState((prev) => ({ ...prev, departmentFilter: value }))
                  }
                  onSearchChange={(value) =>
                    setState((prev) => ({ ...prev, searchTerm: value }))
                  }
                  onViewChange={(value: "day" | "week" | "month") =>
                    setState((prev) => ({ ...prev, view: value }))
                  }
                  onDateRangeChange={handleDateRangeChange}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onToday={handleToday}
                  onCreateNewShift={handleCreateNewShift}
                  onPublishSchedule={handlePublishSchedule}
                  onUndoChanges={handleUndoChanges}
                  copiedWeekSchedule={state.copiedWeekSchedule}
                  scheduleTemplates={state.scheduleTemplates}
                  onCopyWeek={handleCopyWeek}
                  onPasteWeek={() => handlePasteWeek()}
                  onShowCopyPasteModal={() =>
                    setState((prev) => ({
                      ...prev,
                      isCopyWeekModalVisible: true,
                    }))
                  }
                  onShowTemplateModal={() =>
                    setState((prev) => ({
                      ...prev,
                      isTemplateModalVisible: true,
                    }))
                  }
                  onApplyTemplate={handleApplyTemplate}
                  hasCurrentWeekData={
                    displayedShifts.length > 0 ||
                    state.draftShifts.length > 0 ||
                    state.unassignedShifts.length > 0
                  }
                />

                {/* Create Shift Modal */}
                <CreateShiftModal
                  visible={state.isCreateShiftModalVisible}
                  onCancel={() => 
                    {  setState((prev) => ({
                      ...prev,
                      isCreateShiftModalVisible: false

                      }))
                    }}
                  onSave={handleSaveShift}
                  employees={state.employees} // Pass full employee objects
                  positions={Array.from(
                    new Set(
                      state.employees
                        .map((emp) => emp?.position)
                        .filter(Boolean)
                    )
                  )}
                  clients={state.clients}
                  selectedDate={state.selectedDateForModal}
                  isUnassigned={state.isCreateUnassignedModal}
                  selectedEmployee={state.employees.find(
                    (e) => e.id === state.selectedEmployeeForModal
                  )}
                />

                {/* Week Copy/Paste Modal */}
                <WeekCopyPasteModal
                  visible={state.isCopyWeekModalVisible}
                  onCancel={() =>
                    setState((prev) => ({
                      ...prev,
                      isCopyWeekModalVisible: false,
                    }))
                  }
                  copiedWeekSchedule={state.copiedWeekSchedule}
                  currentWeek={state.dateRange[0]}
                  onCopyWeek={() => {
                    handleCopyWeek();
                    setState((prev) => ({
                      ...prev,
                      isCopyWeekModalVisible: false,
                    }));
                  }}
                  onPasteWeek={(targetWeek) => {
                    handlePasteWeek(targetWeek);
                    setState((prev) => ({
                      ...prev,
                      isCopyWeekModalVisible: false,
                    }));
                  }}
                  loading={state.loading.shifts}
                />

                {/* Schedule Template Modal */}
                <ScheduleTemplateModal
                  visible={state.isTemplateModalVisible}
                  onCancel={() =>
                    setState((prev) => ({
                      ...prev,
                      isTemplateModalVisible: false,
                      templateName: "",
                      templateDescription: "",
                    }))
                  }
                  templates={state.scheduleTemplates}
                  onSaveTemplate={handleSaveAsTemplate}
                  onApplyTemplate={handleApplyTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  hasCurrentWeekData={
                    displayedShifts.length > 0 ||
                    state.draftShifts.length > 0 ||
                    state.unassignedShifts.length > 0
                  }
                  loading={state.loading.shifts}
                />
                {/* Error Display */}
                {state.error && (
                  <Alert
                    message={state.error}
                    type="error"
                    showIcon
                    closable
                    onClose={() =>
                      setState((prev) => ({ ...prev, error: null }))
                    }
                    className="mb-6 rounded-lg"
                  />
                )}

                {/* Compliance Warnings */}
                {state.complianceWarnings.length > 0 && (
                  <div className="mb-6">
                    <ComplianceWarnings
                      warnings={state.complianceWarnings}
                      onClose={() =>
                        setState((prev) => ({
                          ...prev,
                          complianceWarnings: [],
                        }))
                      }
                    />
                  </div>
                )}

                {/* Main Schedule Grid */}
                {state.loading.shifts ? (
                  <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
                    <Spin size="large" />
                  </div>
                ) : (
                  <ScheduleGrid
                    employees={filteredEmployees}
                    daysInView={daysInView}
                    shifts={displayedShifts}
                    unassignedShifts={state.unassignedShifts}
                    draftShifts={state.draftShifts}
                    loading={state.loading.shifts || state.loading.publishing}
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
                    onCreateNewShift={handleCreateNewShift}
                    getEmployeeFullName={getEmployeeFullName}
                  />
                )}

                {/* Edit Shift Time Modal */}
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

                {/* Drag Preview Overlay */}
                {state.dragState.isDragging && state.dragState.dropPreview && (
                  <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-none">
                    {state.dragState.dropPreview}
                  </div>
                )}

                {/* Pending Operations Indicator */}
                {(state.optimisticUpdates.pendingMoves.size > 0 ||
                  state.optimisticUpdates.pendingSwaps.size > 0 ||
                  state.optimisticUpdates.pendingDeletes.size > 0) && (
                  <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg shadow-lg">
                    Syncing changes...
                  </div>
                )}

                {/* AI Scheduler Modal */}

                {/* Open Shifts Modal */}

                {/* Shift Swaps Modal */}
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default SchedulerPage;
