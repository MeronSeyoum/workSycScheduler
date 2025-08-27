import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaStore,
  FaCalendarAlt,
  FaPrint,
  FaFileExport,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { MdDragIndicator } from "react-icons/md";
import {
  DatePicker,
  Select,
  Modal,
  Spin,
  Alert,
  Button,
  Avatar,
  Dropdown,
  notification,
} from "antd";
import { MoreVertical, PlusIcon } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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

// Configure dayjs plugins for date manipulation
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);

const { RangePicker } = DatePicker;
const { Option } = Select;

// =============================================
// CONSTANTS AND CONFIGURATIONS
// =============================================

// Default time for new shifts
const DEFAULT_SHIFT_TIME = { start: "08:00", end: "16:00" };

// Color scheme for UI components
const colors = {
  primary: "#3B82F6",
  secondary: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  textSecondary: "#6B7280",
};

// Color mapping for different employee roles
const roleColors: Record<string, string> = {
  "Cleaning Supervisor": colors.primary,
  Janitor: colors.secondary,
  Manager: colors.warning,
  Default: colors.textSecondary,
};

// Department options for filtering employees
const departments = [
  "Manager",
  "Cleaning Supervisor",
  "General Cleaning",
  "Janitor",
  "Restroom Services",
];

// Drag item types
const ItemTypes = {
  SHIFT: "shift",
};

// =============================================
// TYPE INTERFACES
// =============================================

interface LocationData {
  id: string;
  name: string;
}

interface LoadingState {
  shifts: boolean;
  employees: boolean;
  clients: boolean;
  general: boolean;
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
  dragShift: ShiftWithEmployees | null;
  error: string | null;
  loading: LoadingState;
}

interface DragItem {
  type: string;
  shift: ShiftWithEmployees;
}

// =============================================
// DRAG AND DROP COMPONENTS
// =============================================

/**
 * ShiftCard component with drag and drop capabilities
 */
const ShiftCard: React.FC<{
  shift: ShiftWithEmployees;
  onDrop: (
    targetShift: ShiftWithEmployees,
    sourceShift: ShiftWithEmployees
  ) => void;
  onDelete: (shiftId: number) => void;
  onEdit: (shift: ShiftWithEmployees) => void;
}> = ({ shift, onDrop, onDelete, onEdit }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SHIFT,
    item: { shift },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.SHIFT,
    drop: (item: DragItem) => {
      if (item.shift.id !== shift.id) {
        onDrop(shift, item.shift);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  if (shift.employees.length === 0) return null;

  const employee = shift.employees[0].employee;
  const roleColor = roleColors[employee.position || ""] || roleColors.Default;
  const employeeName = employee.user
    ? `${employee.user.first_name} ${employee.user.last_name}`
    : "Unknown Employee";
  const timeRange = `${shift.start_time
    .split(":")
    .slice(0, 2)
    .join(":")} - ${shift.end_time.split(":").slice(0, 2).join(":")}`;
  const clientName = shift.client?.business_name || "Unknown Client";

  const dropdownItems = [
    {
      key: "edit",
      label: "Edit Time",
      icon: <FaEdit className="text-blue-500" />,
      onClick: () => onEdit(shift),
    },
    {
      key: "delete",
      label: "Delete Shift",
      icon: <FaTrash className="text-red-500" />,
      danger: true,
      onClick: () => onDelete(shift.id),
    },
  ];

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`relative group p-3 mb-2 shadow-xs transition-all z-10
                   border border-gray-100 hover:border-gray-200 bg-white hover:shadow-sm
                   hover:translate-y-[0px] transform duration-150
                   cursor-grab active:cursor-grabbing ${
                   isDragging ? "opacity-50" : "opacity-100"
                 }`}
      style={{ display: "absolute",
        borderLeft: `4px solid ${roleColor}`,
        boxShadow: `0 1px 3px 0 rgba(0, 0, 0, 0.1)`,
        background: `linear-gradient(to right, rgba(${parseInt(
          roleColor.slice(1, 3),
          16
        )}, ${parseInt(roleColor.slice(3, 5), 16)}, ${parseInt(
          roleColor.slice(5, 7),
          16
        )}, 0.05) 0%, white 20%)`,
      }}
      data-tooltip-id={`shift-${shift.id}`}
      data-tooltip-html={`
        <div class="p-1 bg-white  order border-gray-200 max-w-xs">
          <div class="font-semibold text-gray-800">
            ${employeeName}
          </div>
          <div class="text-sm text-gray-600 mb-1">${
            employee.position || "No Position"
          }</div>
          <div class="flex items-center gap-2 text-sm text-gray-700 mb-1">
            <span class="inline-block w-2 h-2 rounded-full" style="background-color: ${roleColor}"></span>
            ${timeRange}
          </div>
          <div class="text-xs text-gray-500">
            ${clientName}
          </div>
        </div>
      `}
    >
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-medium text-gray-500">{timeRange}</span>
          <p className="text-sm font-medium text-gray-800 truncate">
            {employeeName.split(" ")[0]}&apos;s Shift
          </p>
        </div>

        <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
          <Button
            type="text"
            size="small"
            icon={
              <MoreVertical className="text-gray-400 hover:text-gray-600 transition-colors" />
            }
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </Dropdown>
      </div>
      <Tooltip
        id={`shift-${shift.id}`}
        className="!bg-white !opacity-100 !shadow-md !border !border-gray-200 !rounded-lg"
      />
    </div>
  );
};

/**
 * EmptyShiftCell component for adding new shifts
 */
const EmptyShiftCell: React.FC<{
  employeeId: number;
  date: string;
  isToday: boolean;
  onAdd: (employeeId: number, date: string) => void;
}> = React.memo(({ employeeId, date, isToday, onAdd }) => (
  <div
    className={`flex-1 flex flex-col items-center justify-center text-center p-2 rounded-lg h-full min-h-[60px] ${
      isToday
        ? "border-2 border-blue-300 bg-blue-50 hover:bg-blue-100"
        : "border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50"
    } transition-all cursor-pointer hover:shadow-xs`}
    onClick={() => onAdd(employeeId, date)}
  >
    <PlusIcon
      className={`w-4 h-4 mb-1 ${isToday ? "text-blue-500" : "text-gray-400"}`}
    />
    <span
      className={`text-xs font-medium ${
        isToday ? "text-blue-600" : "text-gray-500"
      }`}
    >
      {isToday ? "Add to today" : "Add shift"}
    </span>
  </div>
));

EmptyShiftCell.displayName = "EmptyShiftCell";

// =============================================
// MAIN COMPONENT
// =============================================

const ShiftSchedulerByLocation: React.FC = () => {
  // =============================================
  // HOOKS AND STATE MANAGEMENT
  // =============================================

  // Authentication hook
  const { token } = useAuth();

  // Main component state
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
    dragShift: null,
    error: null,
    loading: {
      shifts: false,
      employees: false,
      clients: false,
      general: false,
    },
  });

  // Loading state for initial data fetching
  const [preLoading, setPreLoading] = useState(false);

  // Notification system setup
  const [api, contextHolder] = notification.useNotification();

  // =============================================
  // UTILITY FUNCTIONS
  // =============================================

  /**
   * Helper function to show notifications with consistent styling
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

  /**
   * Safely gets employee's full name, handling missing data
   */
  const getEmployeeFullName = useCallback((employee: Employee): string => {
    if (!employee.user) {
      return (
        `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
        "Unknown Employee"
      );
    }
    return (
      `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
      "Unknown Employee"
    );
  }, []);

  /**
   * Validates that shift end time is after start time
   */
  const validateShiftTime = useCallback(
    (startTime: string, endTime: string): boolean => {
      const start = dayjs(startTime, "HH:mm");
      const end = dayjs(endTime, "HH:mm");
      return start.isBefore(end);
    },
    []
  );

  // =============================================
  // API OPERATIONS
  // =============================================

  /**
   * Handles adding a new shift for an employee on a specific date
   */
  const handleAddShift = useCallback(
    async (employeeId: number, date: string) => {
      if (!token || !state.selectedLocation) {
        setState((prev) => ({
          ...prev,
          error: "Authentication or location required",
        }));
        return;
      }

      // Find employee for notification
      const employee = state.employees.find((e) => e.id === employeeId);
      if (!employee) {
        setState((prev) => ({ ...prev, error: "Employee not found" }));
        return;
      }

      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: true },
        }));

        // Prepare shift creation data
        const createShiftDto: CreateShiftWithEmployeesDto = {
          client_id: parseInt(state.selectedLocation.id),
          date: dayjs(date).format("YYYY-MM-DD"),
          start_time: DEFAULT_SHIFT_TIME.start,
          end_time: DEFAULT_SHIFT_TIME.end,
          employee_ids: [employeeId],
          shift_type: "regular",
        };

        // Create shift via API
        const { shift, employeeShifts } = await apiCall.shifts.createShift(
          createShiftDto,
          token
        );

        // Create new shift object with employees
        const newShiftWithEmployees: ShiftWithEmployees = {
          ...shift,
          employees: employeeShifts || [],
        };

        // Update local state
        setState((prev) => ({
          ...prev,
          shifts: [...prev.shifts, newShiftWithEmployees],
          loading: { ...prev.loading, shifts: false },
          error: null,
        }));

        showNotification(
          "success",
          "Shift Created",
          `Shift for ${getEmployeeFullName(employee)} was successfully created`
        );
      } catch (error) {
        console.error("Failed to create shift:", error);
        showNotification(
          "error",
          "Create Shift Failed",
          error instanceof Error ? error.message : "Failed to create shift"
        );
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: false },
        }));
      }
    },
    [
      token,
      state.selectedLocation,
      state.employees,
      getEmployeeFullName,
      showNotification,
    ]
  );

  /**
   * Handles updating shift time through the modal
   */
  const handleUpdateShiftTime = useCallback(async () => {
    if (!state.shiftToEdit || !token) return;

    // Format time to HH:mm
    const formattedStart = state.newTime.start.split(":").slice(0, 2).join(":");
    const formattedEnd = state.newTime.end.split(":").slice(0, 2).join(":");

    // Validate time range
    if (!validateShiftTime(formattedStart, formattedEnd)) {
      setState((prev) => ({
        ...prev,
        error: "End time must be after start time",
      }));
      return;
    }

    try {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, shifts: true },
      }));

      // Prepare update data
      const updateDto: UpdateShiftDto = {
        start_time: formattedStart,
        end_time: formattedEnd,
      };

      // Update shift via API
      const updatedShift = await apiCall.shifts.updateShift(
        state.shiftToEdit.id,
        updateDto,
        token
      );

      // Update local state
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
  }, [
    state.shiftToEdit,
    state.newTime,
    token,
    validateShiftTime,
    showNotification,
  ]);

  /**
   * Handles deleting a shift
   */
  const handleDeleteShift = useCallback(
    async (shiftId: number) => {
      if (!token) return;

      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: true },
        }));

        // Delete shift via API
        await apiCall.shifts.deleteShift(shiftId, token);

        // Update local state
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

  /**
   * Swaps two shifts between employees/dates
   */
  const handleSwapShifts = useCallback(
    async (
      targetShift: ShiftWithEmployees,
      sourceShift: ShiftWithEmployees
    ) => {
      if (!token) return;

      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: true },
        }));

        // Validate shifts have employees
        if (
          sourceShift.employees.length === 0 ||
          targetShift.employees.length === 0
        ) {
          throw new Error("Shift has no assigned employees");
        }

        // Create swap operations
        const swapOperations = [
          {
            shiftId: sourceShift.id,
            newEmployeeId: targetShift.employees[0].employee.id,
            newDate: targetShift.date,
          },
          {
            shiftId: targetShift.id,
            newEmployeeId: sourceShift.employees[0].employee.id,
            newDate: sourceShift.date,
          },
        ];

        // Perform swap operations
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

        // Update local state with swapped shifts
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

  // =============================================
  // DATA FETCHING EFFECTS
  // =============================================

  /**
   * Effect to fetch initial data (clients and employees) when component mounts
   */
  useEffect(() => {
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, general: true },
        }));

        // Fetch clients and employees in parallel
        const [clients, employees] = await Promise.all([
          apiCall.clients.fetchClients(token),
          apiCall.employees.fetchEmployees(token),
        ]);

        // Update state with fetched data
        setState((prev) => ({
          ...prev,
          clients,
          employees,
          selectedLocation: clients[0]
            ? {
                id: clients[0].id.toString(),
                name: clients[0].business_name,
              }
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
   * Effect to fetch shifts when location or date range changes
   */
  useEffect(() => {
    if (!token || !state.selectedLocation) return;

    const fetchShiftsData = async () => {
      try {
        setPreLoading(true);
        setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, shifts: true },
        }));

        // Fetch shifts for selected location and date range
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
          error:
            error instanceof Error ? error.message : "Failed to load shifts",
          shifts: [],
          loading: { ...prev.loading, shifts: false },
        }));
        setPreLoading(false);
        console.error("Shift fetch error:", error);
      }
    };

    fetchShiftsData();
  }, [token, state.selectedLocation, state.dateRange]);

  // =============================================
  // COMPUTED VALUES (MEMOIZED)
  // =============================================

  /**
   * Filtered employees based on search term, department, and location
   */
  const filteredEmployees = useMemo(() => {
    return state.employees.filter((employee) => {
      if (!state.selectedLocation) return false;

      // Check if employee is assigned to selected location
      const matchesLocation = employee.assigned_locations?.includes(
        state.selectedLocation.name
      );

      // Check search term against name and position
      const search = state.searchTerm.toLowerCase();
      const fullName = getEmployeeFullName(employee).toLowerCase();
      const position = employee.position?.toLowerCase() ?? "";

      const matchesSearch =
        search === "" || fullName.includes(search) || position.includes(search);

      // Check department filter
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

  /**
   * Shifts filtered by selected location and date range
   */
  const displayedShifts = useMemo(() => {
    if (!state.selectedLocation) return [];

    return state.shifts
      .filter(
        (shift) =>
          shift.client_id === parseInt(state.selectedLocation!.id) &&
          (state.view === "day"
            ? dayjs(shift.date).isSame(state.dateRange[0], "day")
            : dayjs(shift.date).isBetween(
                state.dateRange[0],
                state.dateRange[1],
                "day",
                "[]"
              ))
      )
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [state.shifts, state.selectedLocation, state.view, state.dateRange]);

  /**
   * Array of days to display in the current view
   */
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

  // =============================================
  // RENDER LOGIC
  // =============================================

  // Show location selection if no location is selected but clients are loaded
  if (!state.selectedLocation && state.clients.length > 0) {
    return (
      <div className="p-4">
        <Alert
          message="Please select a location"
          type="info"
          showIcon
          className="mb-4"
        />
        <Select
          className="w-full max-w-md"
          placeholder="Select a location"
          onChange={(value) => {
            const client = state.clients.find((c) => c.id.toString() === value);
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
        >
          {state.clients.map((client) => (
            <Option key={client.id} value={client.id.toString()}>
              {client.business_name}
            </Option>
          ))}
        </Select>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen">
        {/* Notification context holder */}
        {contextHolder}

        {/* Loading skeleton */}
        {preLoading ? (
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* =============================================
                HEADER SECTION
                ============================================= */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-xs border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-50">
                  <FaStore className="text-teal-600 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {state.selectedLocation?.name || "Shift Scheduler"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {state.view === "day"
                      ? state.dateRange[0].format("MMMM D, YYYY")
                      : `${state.dateRange[0].format(
                          "MMM D"
                        )} - ${state.dateRange[1].format("MMM D, YYYY")}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {/* Week Navigation Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const newStart = state.dateRange[0]
                        .subtract(1, "week")
                        .startOf("isoWeek");
                      setState((prev) => ({
                        ...prev,
                        dateRange: [newStart, newStart.endOf("isoWeek")],
                      }));
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Previous week"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => {
                      const newStart = dayjs().startOf("isoWeek");
                      setState((prev) => ({
                        ...prev,
                        dateRange: [newStart, newStart.endOf("isoWeek")],
                      }));
                    }}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Today
                  </button>

                  <button
                    onClick={() => {
                      const newStart = state.dateRange[0]
                        .add(1, "week")
                        .startOf("isoWeek");
                      setState((prev) => ({
                        ...prev,
                        dateRange: [newStart, newStart.endOf("isoWeek")],
                      }));
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Next week"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                {/* View Selector and Date Range Picker */}
                <Select
                  value={state.view}
                  onChange={(value: "day" | "week" | "month") =>
                    setState((prev) => ({ ...prev, view: value }))
                  }
                  className="w-32 rounded-lg"
                  suffixIcon={<FaCalendarAlt className="text-gray-400" />}
                  dropdownStyle={{ borderRadius: "12px" }}
                >
                  <Option value="day">Day View</Option>
                  <Option value="week">Week View</Option>
                  <Option value="month">Month View</Option>
                </Select>

                <RangePicker
                  value={state.dateRange}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setState((prev) => ({
                        ...prev,
                        dateRange: [dates[0], dates[1]],
                      }));
                    }
                  }}
                  className="w-64 rounded-lg [&_.ant-picker-input>input]:text-sm"
                  popupClassName="rounded-lg"
                />
              </div>
            </div>

            {/* =============================================
                ERROR ALERT
                ============================================= */}
            {state.error && (
              <Alert
                message={state.error}
                type="error"
                showIcon
                closable
                onClose={() => setState((prev) => ({ ...prev, error: null }))}
                className="mb-6 rounded-lg"
              />
            )}

            {/* =============================================
                FILTERS SECTION
                ============================================= */}
            <div className="bg-white p-4 rounded-xl shadow-xs my-6 flex flex-wrap gap-4 items-center border border-gray-200">
              {/* Location Selector */}
              <div className="flex items-center gap-2 flex-1 min-w-[250px]">
                <div className="p-2 rounded-lg bg-teal-50">
                  <FaStore className="text-teal-600" />
                </div>
                <Select
                  className="flex-1 rounded-lg"
                  value={state.selectedLocation?.id}
                  onChange={(value) => {
                    const client = state.clients.find(
                      (c) => c.id.toString() === value
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
                  loading={state.loading.clients}
                  placeholder="Select location"
                  dropdownStyle={{ borderRadius: "12px" }}
                >
                  {state.clients.map((client) => (
                    <Option key={client.id} value={client.id.toString()}>
                      {client.business_name}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Search Input */}
              <div className="relative flex-1 min-w-[250px]">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 p-2 rounded-lg bg-gray-50">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={state.searchTerm}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      searchTerm: e.target.value,
                    }))
                  }
                  className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm h-10 bg-gray-50"
                  disabled={state.loading.employees}
                />
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="p-2 rounded-lg bg-teal-50">
                  <FaFilter className="text-teal-600" />
                </div>
                <Select
                  value={state.departmentFilter}
                  onChange={(value) =>
                    setState((prev) => ({ ...prev, departmentFilter: value }))
                  }
                  className="flex-1 rounded-lg"
                  disabled={state.loading.employees}
                  dropdownStyle={{ borderRadius: "12px" }}
                >
                  <Option value="All">All Departments</Option>
                  {departments.map((dept) => (
                    <Option key={dept} value={dept}>
                      {dept}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-auto">
                <Button
                  icon={<FaPrint className="text-teal-600" />}
                  className="flex items-center gap-2 text-gray-700 hover:text-teal-600 border border-gray-200 rounded-lg hover:border-teal-300 bg-white"
                  disabled={state.loading.shifts}
                >
                  Print
                </Button>
                <Button
                  icon={<FaFileExport className="text-teal-600" />}
                  className="flex items-center gap-2 text-gray-700 hover:text-teal-600 border border-gray-200 rounded-lg hover:border-teal-300 bg-white"
                  disabled={state.loading.shifts}
                >
                  Export
                </Button>
              </div>
            </div>

            {/* =============================================
                SCHEDULE GRID SECTION
                ============================================= */}
            {state.loading.shifts ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-xs border border-gray-200">
                <Spin size="large" />
              </div>
            ) : (
              <div className="rounded-xl shadow-xs overflow-hidden bg-white border border-gray-200">
                <div className="overflow-x-auto ">
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `200px repeat(${
                        state.view === "week" ? 7 : 1
                      }, minmax(150px, 1fr))`,
                    }}
                  >
                    {/* =============================================
                        GRID HEADER ROW
                        ============================================= */}
                    <div className="bg-teal-600 p-3 font-semibold text-white border-r sticky left-0 flex items-center z-10">
                      <MdDragIndicator className="text-teal-200 mr-2 text-lg" />
                      <span>Employee</span>
                    </div>

                    {/* Day Header Columns */}
                    {daysInView.map((day) => {
                      const isToday = dayjs().isSame(day, "day");
                      const isWeekend = [0, 6].includes(day.day());

                      return (
                        <div
                          key={day.format("YYYY-MM-DD")}
                          className={`p-3 text-center font-semibold border-b border-r ${
                            isToday
                              ? "bg-blue-50 border-blue-100"
                              : isWeekend
                              ? "bg-gray-50 border-gray-100"
                              : "bg-white border-gray-100"
                          }`}
                        >
                          <div
                            className={`text-sm font-semibold ${
                              isToday
                                ? "text-blue-600"
                                : isWeekend
                                ? "text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            {day.format("ddd")}
                          </div>
                          <div
                            className={`text-xs font-medium ${
                              isToday
                                ? "text-blue-500"
                                : isWeekend
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {day.format("MMM D")}
                          </div>
                        </div>
                      );
                    })}

                    {/* =============================================
                        EMPLOYEE ROWS WITH SHIFT CELLS
                        ============================================= */}
                    {filteredEmployees.map((employee) => (
                      <React.Fragment key={employee.id}>
                        {/* Employee Name Column */}
                        <div className="flex items-center gap-3 p-3 border-b border-r border-gray-100 bg-white sticky left-0 hover:bg-gray-50 transition-colors shadow-sm z-0">
                          <Avatar
                            className="bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-xs"
                            size="default"
                            style={{ minWidth: "36px" }}
                          >
                            {getEmployeeFullName(employee)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </Avatar>

                          {/* Employee Info */}
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate text-gray-800">
                              {getEmployeeFullName(employee)}
                            </div>
                            <div className="text-xs truncate text-gray-500">
                              {employee.position}
                            </div>
                          </div>
                        </div>

                        {/* Shift Cells for each day */}
                        {daysInView.map((day) => {
                          const dateStr = day.format("YYYY-MM-DD");
                          const employeeShifts = displayedShifts.filter(
                            (s) =>
                              s.employees.some(
                                (e) => e.employee.id === employee.id
                              ) && s.date === dateStr
                          );
                          const isToday = dayjs().isSame(day, "day");
                          const isWeekend = [0, 6].includes(day.day());

                          return (
                            <div
                              key={`${employee.id}-${dateStr}`}
                              className={`p-1 border-b border-r min-h-16 ${
                                isToday
                                  ? "bg-blue-50/50 border-blue-100"
                                  : isWeekend
                                  ? "bg-gray-50 border-gray-100"
                                  : "bg-white border-gray-100"
                              }`}
                            >
                              <div className="space-y-1 h-full flex flex-col">
                                {/* Empty State - Show when no shifts exist */}
                                {employeeShifts.length === 0 && (
                                  <EmptyShiftCell
                                    employeeId={employee.id}
                                    date={dateStr}
                                    isToday={isToday}
                                    onAdd={handleAddShift}
                                  />
                                )}

                                {/* Render existing shifts */}
                                {employeeShifts.map((shift) => (
                                  <ShiftCard
                                    key={shift.id}
                                    shift={shift}
                                    onDrop={handleSwapShifts}
                                    onDelete={handleDeleteShift}
                                    onEdit={(shift) => {
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
                                  />
                                ))}

                                {/* Add another shift button when shifts already exist */}
                                {employeeShifts.length > 0 && (
                                  <button
                                    onClick={() =>
                                      handleAddShift(employee.id, dateStr)
                                    }
                                    className="w-full text-xs text-gray-400 hover:text-blue-500 flex items-center justify-center mt-auto transition-colors group py-1"
                                    disabled={state.loading.shifts}
                                  >
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 mr-1">
                                      <PlusIcon className="w-3 h-3" />
                                    </span>
                                    Add another
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =============================================
                EDIT SHIFT TIME MODAL
                ============================================= */}
            <Modal
              title="Edit Shift Time"
              open={state.isTimePickerModalOpen}
              onOk={handleUpdateShiftTime}
              onCancel={() => {
                setState((prev) => ({
                  ...prev,
                  isTimePickerModalOpen: false,
                  error: null,
                }));
              }}
              okText="Save Changes"
              cancelText="Cancel"
              confirmLoading={state.loading.shifts}
              width={400}
              styles={{
                header: {
                  borderBottom: "1px solid #f0f0f0",
                  padding: "16px 24px",
                },
                body: { padding: "24px" },
                footer: {
                  borderTop: "1px solid #f0f0f0",
                  padding: "16px 24px",
                },
              }}
              className="rounded-lg"
            >
              {state.shiftToEdit && (
                <div className="space-y-4">
                  {/* Time Input Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={state.newTime.start}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            newTime: { ...prev.newTime, start: e.target.value },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={state.newTime.end}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            newTime: { ...prev.newTime, end: e.target.value },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* Error Alert in Modal */}
                  {state.error && (
                    <Alert
                      message={state.error}
                      type="error"
                      showIcon
                      className="mt-2 rounded-lg"
                    />
                  )}
                </div>
              )}
            </Modal>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default ShiftSchedulerByLocation;
