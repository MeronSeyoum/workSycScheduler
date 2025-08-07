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
  Menu,
  notification,
} from "antd";
import { MoreVertical, PlusIcon } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import { Client } from "@/types/client";
import { Employee } from "@/types/employee";
import { useAuth } from "../../components/AuthProvider";
import { api as apiCall } from "@/service/api";
import { ShiftWithEmployees } from "@/types/shift";
import { Skeleton } from "@/components/ui/skeleton";

// Configure dayjs plugins
dayjs.extend(isBetween);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);

const { RangePicker } = DatePicker;
const { Option } = Select;

// Constants
const DEFAULT_SHIFT_TIME = { start: "08:00", end: "16:00" };

// Color scheme for different roles
const colors = {
  primary: "#3B82F6",
  secondary: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  textSecondary: "#6B7280",
};

const roleColors: Record<string, string> = {
  "Cleaning Supervisor": colors.primary,
  Janitor: colors.secondary,
  Manager: colors.warning,
  Default: colors.textSecondary,
};

// Department options for filtering
const departments = [
  "Manager",
  "Cleaning Supervisor",
  "General Cleaning",
  "Janitor",
  "Restroom Services",
];

interface LocationData {
  id: string;
  name: string;
}

const ShiftSchedulerByLocation = () => {
  // Authentication
  const { token } = useAuth();

  // State management
  const [state, setState] = useState({
    shifts: [] as ShiftWithEmployees[],
    employees: [] as Employee[],
    clients: [] as Client[],
    selectedLocation: null as LocationData | null,
    dateRange: [dayjs().startOf("isoWeek"), dayjs().endOf("isoWeek")] as [
      Dayjs,
      Dayjs
    ],
    view: "week" as "day" | "week" | "month",
    searchTerm: "",
    departmentFilter: "All",
    isTimePickerModalOpen: false,
    shiftToEdit: null as ShiftWithEmployees | null,
    newTime: DEFAULT_SHIFT_TIME,
    dragShift: null as ShiftWithEmployees | null,
    error: null as string | null,
    loading: {
      shifts: false,
      employees: false,
      clients: false,
      general: false,
    },
  });
  const [preLoading, setPreLoading] = useState(false);
  // Notification system
  const [api, contextHolder] = notification.useNotification();

  /**
   * Helper function to show notifications
   */
  const showNotification = (
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
  };

  /**
   * Gets employee's full name
   */
  const getEmployeeFullName = (employee: Employee) =>
    `${employee.first_name} ${employee.last_name}`;

  /**
   * Validates that shift end time is after start time
   */
  const validateShiftTime = (startTime: string, endTime: string) => {
    const start = dayjs(startTime, "HH:mm");
    const end = dayjs(endTime, "HH:mm");
    return start.isBefore(end);
  };

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
            ? {
                id: clients[0].id.toString(),
                name: clients[0].business_name,
              }
            : null,
          loading: { ...prev.loading, general: false },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: "Failed to load initial data",
          loading: { ...prev.loading, general: false },
        }));
        console.error(error);
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
            clientId: parseInt(state.selectedLocation.id),
            startDate: state.dateRange[0].format("YYYY-MM-DD"),
            endDate: state.dateRange[1].format("YYYY-MM-DD"),
          },
          token
        );

        setState((prev) => ({
          ...prev,
          shifts,
          loading: { ...prev.loading, shifts: false },
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
        console.error("Shift fetch error:", error);
      }
    };

    fetchShiftsData();
  }, [token, state.selectedLocation, state.dateRange]);

  /**
   * Handles adding a new shift for an employee
   */
  const handleAddShift = async (employeeId: number, date: string) => {
    if (!token || !state.selectedLocation) {
      setState((prev) => ({
        ...prev,
        error: "Authentication or location required",
      }));
      return;
    }

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

      const { shift, employeeShifts } = await apiCall.shifts.createShift(
        {
          client_id: parseInt(state.selectedLocation.id),
          date: dayjs(date).format("YYYY-MM-DD"),
          start_time: DEFAULT_SHIFT_TIME.start,
          end_time: DEFAULT_SHIFT_TIME.end,
          employee_ids: [employeeId],
          shift_type: "regular",
        },
        token
      );

      setState((prev) => ({
        ...prev,
        shifts: [...prev.shifts, { ...shift, employees: employeeShifts }],
        loading: { ...prev.loading, shifts: false },
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
  };

  /**
   * Handles updating shift time
   */
  const handleUpdateShiftTime = async () => {
    if (!state.shiftToEdit || !token) return;

    const formattedStart = state.newTime.start.split(":").slice(0, 2).join(":");
    const formattedEnd = state.newTime.end.split(":").slice(0, 2).join(":");

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

      const updatedShift = await apiCall.shifts.updateShift(
        state.shiftToEdit.id,
        {
          start_time: formattedStart,
          end_time: formattedEnd,
        },
        token
      );

      setState((prev) => ({
        ...prev,
        shifts: prev.shifts.map((s) =>
          s.id === state.shiftToEdit!.id ? updatedShift : s
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
  };

  /**
   * Handles deleting a shift
   */
  const handleDeleteShift = async (shiftId: number) => {
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
  };

  // Drag and drop handlers
  const handleDragStart = (shift: ShiftWithEmployees) => {
    setState((prev) => ({ ...prev, dragShift: shift }));
  };

  const handleDrop = async (employeeId: number, date: string) => {
    if (!state.dragShift || !token) return;

    try {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, shifts: true },
      }));

      const { oldShiftId, newShift } = await apiCall.shifts.moveShiftToDate(
        state.dragShift.id,
        dayjs(date).format("YYYY-MM-DD"),
        state.dragShift.employees[0].employee.id,
        token
      );

      setState((prev) => ({
        ...prev,
        shifts: [...prev.shifts.filter((s) => s.id !== oldShiftId), newShift],
        dragShift: null,
        loading: { ...prev.loading, shifts: false },
      }));

      showNotification(
        "success",
        "Shift Moved",
        "Shift was successfully moved to new date"
      );
    } catch (error) {
      console.error(error);
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
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // Filtered data calculations
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
  ]);

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

  const daysInView = useMemo(() => {
    if (state.view === "day") return [state.dateRange[0]];

    const days = [];
    let current = state.dateRange[0].clone();

    while (current.isSameOrBefore(state.dateRange[1])) {
      days.push(current.clone());
      current = current.add(1, "day");
    }
    return days;
  }, [state.view, state.dateRange]);

  /**
   * Renders a shift card component
   */
  const ShiftCard = ({ shift }: { shift: ShiftWithEmployees }) => {
    if (shift.employees.length === 0) return null;
    const employee = shift.employees[0].employee;
    const roleColor = roleColors[employee.position || ""] || roleColors.Default;

    return (
      <>
        <div
          key={shift.id}
          className="relative group p-2 mb-1 rounded shadow-xs transition-all"
          style={{
            backgroundColor: roleColor,
            borderLeft: `3px solid ${roleColor}80`,
          }}
          data-tooltip-id={`shift-${shift.id}`}
          data-tooltip-html={`
            <div className="p-2">
              <div className="font-semibold text-indigo-600">
                ${employee.user.first_name} ${employee.user.last_name}  
              </div>
              <div className="text-sm text-gray-700">${employee.position}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span 
                  className="inline-block w-2 h-2 rounded-full" 
                  style="background-color: ${roleColor}"
                />
                ${shift.start_time
                  .split(":")
                  .slice(0, 2)
                  .join(":")} - ${shift.end_time
            .split(":")
            .slice(0, 2)
            .join(":")}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShopOutlined />
                ${shift.client.business_name}
              </div>
            </div>
          `}
          draggable
          onDragStart={() => handleDragStart(shift)}
        >
          <div className="flex justify-between items-center">
            <span className="text-[13px] font-medium text-white truncate">
              {shift.start_time.split(":").slice(0, 2).join(":")} -{" "}
              {shift.end_time.split(":").slice(0, 2).join(":")}
            </span>

<Dropdown
  menu={{
    items: [
      {
        key: 'edit',
        label: 'Edit Time',
        icon: <FaEdit />,
        onClick: () => {
          setState((prev) => ({
            ...prev,
            shiftToEdit: shift,
            newTime: {
              start: shift.start_time,
              end: shift.end_time,
            },
            isTimePickerModalOpen: true,
          }));
        }
      },
      {
        key: 'delete',
        label: 'Delete Shift',
        icon: <FaTrash />,
        danger: true,
        onClick: () => handleDeleteShift(shift.id)
      }
    ]
  }}
  trigger={['click']}
>
  <Button
    type="text"
    size="small"
    icon={
      <MoreVertical className="text-white opacity-70 group-hover:opacity-100" />
    }
    className="opacity-0 group-hover:opacity-100 transition-opacity"
  />
</Dropdown>
</div>
        </div>
        <Tooltip id={`shift-${shift.id}`} />
      </>
    );
  };

  /**
   * Renders an empty shift cell
   */
  const EmptyShiftCell = ({
    employeeId,
    date,
    isToday,
  }: {
    employeeId: number;
    date: string;
    isToday: boolean;
  }) => (
    <div
      className={`flex-1 flex items-center justify-center text-center p-1 rounded-lg h-full min-h-[40px] ${
        isToday
          ? "border border-blue-200 bg-blue-50 hover:bg-blue-100"
          : "border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      } transition-colors cursor-pointer`}
      onClick={() => handleAddShift(employeeId, date)}
    >
      <span
        className={`text-xs ${isToday ? "text-blue-600" : "text-gray-400"}`}
      >
        {isToday ? "Add to today" : "+ Add shift"}
      </span>
    </div>
  );

  // Loading state
  // if (state.loading.general) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <Spin size="large" />
  //     </div>
  //   );
  // }

  // Location selection required state
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
    <div className="p-4 min-h-screen">
      {contextHolder}
      {preLoading ? (
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <FaStore className="text-[#0F6973] text-xl" />
              <h1 className="text- font-bold text-[#0F6973]">
                {state.selectedLocation?.name || "Shift Scheduler"}
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                value={state.view}
                onChange={(value) =>
                  setState((prev) => ({ ...prev, view: value }))
                }
                className="w-32"
                suffixIcon={<FaCalendarAlt className="text-gray-400" />}
              >
                <Option value="day">Day View</Option>
                <Option value="week">Week View</Option>
                <Option value="month">Month View</Option>
              </Select>

              <RangePicker
                value={state.dateRange}
                onChange={(dates) =>
                  dates && setState((prev) => ({ ...prev, dateRange: dates }))
                }
                className="w-64"
              />
            </div>
          </div>

          {/* Error alert */}
          {state.error && (
            <Alert
              message={state.error}
              type="error"
              showIcon
              closable
              onClose={() => setState((prev) => ({ ...prev, error: null }))}
              className="mb-6"
            />
          )}

          {/* Filters */}
          <div className="bg-[#F2F8F8] p-4 rounded-xl shadow-sm my-6 flex flex-wrap gap-4 items-center border border-gray-200">
            <div className="flex items-center gap-2 flex-1 min-w-[250px]">
              <FaStore className="text-teal-700" />
              <Select
                className="flex-1"
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
              >
                {state.clients.map((client) => (
                  <Option key={client.id} value={client.id.toString()}>
                    {client.business_name}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="relative flex-1 min-w-[250px]">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={state.searchTerm}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, searchTerm: e.target.value }))
                }
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm h-10"
                disabled={state.loading.employees}
              />
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <FaFilter className="text-teal-700" />
              <Select
                value={state.departmentFilter}
                onChange={(value) =>
                  setState((prev) => ({ ...prev, departmentFilter: value }))
                }
                className="flex-1"
                disabled={state.loading.employees}
              >
                <Option value="All">All Departments</Option>
                {departments.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="flex gap-2 ml-auto">
              <Button
                icon={<FaPrint color="#0F6973" />}
                className="flex items-center gap-2 text-slate-900"
                disabled={state.loading.shifts}
              >
                Print
              </Button>
              <Button
                icon={<FaFileExport color="#0F6973" />}
                className="flex items-center gap-2 text-slate-900"
                disabled={state.loading.shifts}
              >
                Export
              </Button>
            </div>
          </div>

          {/* Schedule Grid */}
          {state.loading.shifts ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <div className="rounded-xl shadow-sm overflow-hidden bg-[#F2F8F8] border border-gray-200">
              <div className="overflow-x-auto">
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `200px repeat(${
                      state.view === "week" ? 7 : 1
                    }, minmax(130px, 1fr))`,
                  }}
                >
                  {/* Header row */}
                  <div className="bg-teal-700 p-3 font-semibold text-[#F2F8F8] border-r sticky left-0  flex items-center">
                    <MdDragIndicator className="text-indigo-200 mr-2 text-lg" />
                    <span>Employee</span>
                  </div>

                  {/* Day headers */}
                  {daysInView.map((day) => (
                    <div
                      key={day.format("YYYY-MM-DD")}
                      className="p-3 text-center font-semibold text-gray-700 border-b border-r border-indigo-100"
                    >
                      <div className="text-sm font-semibold text-teal-700">
                        {day.format("ddd")}
                      </div>
                      <div className="text-xs font-medium text-slate-600">
                        {day.format("MMM D")}
                      </div>
                    </div>
                  ))}

                  {/* Employee rows */}
                  {filteredEmployees.map((employee) => (
                    <React.Fragment key={employee.id}>
                      {/* Employee Name Column */}
                      <div className="flex items-center gap-3 p-3 border-b border-r border-gray-100 bg-white sticky left-0  hover:bg-gray-50 transition-colors shadow-sm">
                        <Avatar
                          className="bg-gradient-to-br from-teal-400 to-teal-600"
                          size="default"
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

                      {/* Shift Cells */}
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
                            className={`p-1 border-b border-r border-gray-100 min-h-16 ${
                              isToday
                                ? "bg-blue-50/30"
                                : isWeekend
                                ? "bg-gray-100"
                                : "bg-white"
                            }`}
                            onDrop={() => handleDrop(employee.id, dateStr)}
                            onDragOver={handleDragOver}
                          >
                            <div className="space-y-1 h-full flex flex-col">
                              {/* Empty State */}
                              {employeeShifts.length === 0 && (
                                <EmptyShiftCell
                                  employeeId={employee.id}
                                  date={dateStr}
                                  isToday={isToday}
                                />
                              )}

                              {/* Shifts */}
                              {employeeShifts.map((shift) => (
                                <ShiftCard key={shift.id} shift={shift} />
                              ))}

                              {/* Add Shift Button */}
                              {employeeShifts.length > 0 && (
                                <button
                                  onClick={() =>
                                    handleAddShift(employee.id, dateStr)
                                  }
                                  className="w-full text-xs text-gray-400 hover:text-blue-500 flex items-center justify-center mt-auto transition-colors group"
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

          {/* Edit Shift Time Modal */}
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
          >
            {state.shiftToEdit && (
              <div className="space-y-4 mt-4">
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {state.error && (
                  <Alert
                    message={state.error}
                    type="error"
                    showIcon
                    className="mt-2"
                  />
                )}
              </div>
            )}
          </Modal>
        </div>
      )}
    </div>
  );
};

export default ShiftSchedulerByLocation;
