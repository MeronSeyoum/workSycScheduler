/**
 * ScheduleGrid Component
 * 
 * A comprehensive scheduling grid that displays shifts for employees across multiple days.
 * Features drag-and-drop functionality for shift management, unassigned shifts handling,
 * and visual indicators for today's date and weekends.
 * 
 * Key Features:
 * - Visual grid layout with employee rows and date columns
 * - Drag-and-drop support for shift reassignment and swapping
 * - Unassigned shifts section for temporary shift storage
 * - Loading states and visual feedback
 * - Responsive design with sticky headers
 * 
 * Dependencies:
 * - react-dnd for drag-and-drop functionality
 * - antd for UI components (Avatar, Tooltip)
 * - lucide-react and react-icons for icons
 * - dayjs for date manipulation
 * 
 * Props:
 * @param {Employee[]} employees - List of employees to display
 * @param {Dayjs[]} daysInView - Array of days to show in the grid
 * @param {ShiftWithEmployees[]} shifts - Assigned shifts
 * @param {ShiftWithEmployees[]} unassignedShifts - Unassigned shifts (optional)
 * @param {ShiftWithEmployees[]} draftShifts - Draft shifts (optional)
 * @param {boolean} loading - Loading state indicator
 * @param {function} onAddShift - Callback for adding new shifts
 * @param {function} onMoveShift - Callback for moving shifts between employees/dates
 * @param {function} onSwapShifts - Callback for swapping two shifts
 * @param {function} onDeleteShift - Callback for deleting shifts
 * @param {function} onEditShift - Callback for editing shifts
 * @param {function} onCreateNewShift - Callback for creating new shifts
 * @param {function} getEmployeeFullName - Function to get employee's full name
 */

import React, { useState, useCallback, useMemo, forwardRef } from "react";
import { Avatar, Tooltip } from "antd";
import { PlusIcon } from "lucide-react";
import { MdDragIndicator } from "react-icons/md";
import dayjs, { Dayjs } from "dayjs";
import { useDrop } from "react-dnd";
import { ShiftCard } from "./ShiftCard";
import { EmptyShiftCell } from "./EmptyShiftCell";
import { ShiftWithEmployees } from "@/lib/types/shift";
import { Employee } from "@/lib/types/employee";

// Define drag item types for react-dnd
const ItemTypes = {
  SHIFT: "shift",
  UNASSIGNED_SHIFT: "unassigned_shift",
  DRAFT_SHIFT: "draft_shift",
};

interface DragItem {
  type: string;
  shift: ShiftWithEmployees;
  sourceEmployeeId?: number;
  sourceDate?: string;
  originalColumn?: string;
}

interface ScheduleGridProps {
  employees: Employee[];
  daysInView: Dayjs[];
  shifts: ShiftWithEmployees[];
  unassignedShifts?: ShiftWithEmployees[];
  draftShifts?: ShiftWithEmployees[];
  loading: boolean;
  onAddShift: (employeeId: number, date: string) => void;
  onMoveShift: (
    shift: ShiftWithEmployees,
    employeeId: number,
    date: string
  ) => void;
  onSwapShifts: (
    targetShift: ShiftWithEmployees,
    sourceShift: ShiftWithEmployees
  ) => void;
  onDeleteShift: (shiftId: number) => void;
  onEditShift: (shift: ShiftWithEmployees) => void;
  onCreateNewShift: (date?: string, isUnassigned?: boolean) => void;
  getEmployeeFullName: (employee: Employee) => string;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  employees,
  daysInView,
  shifts,
  unassignedShifts = [],
  draftShifts = [],
  loading,
  onAddShift,
  onMoveShift,
  onSwapShifts,
  onDeleteShift,
  onEditShift,
  onCreateNewShift,
  getEmployeeFullName,
}) => {
  // State to track hover state for unassigned shifts section
  const [isUnassignedHovered, setIsUnassignedHovered] = useState(false);

  /**
   * Memoized shift categorization
   * Combines regular shifts and draft shifts with employees into allShifts
   * Combines unassigned shifts and draft shifts without employees into allUnassignedShifts
   */
  const { allShifts, allUnassignedShifts } = useMemo(() => {
    const allShifts = [
      ...shifts,
      ...draftShifts.filter((s) => s.employees.length > 0),
    ];
    const allUnassignedShifts = [
      ...unassignedShifts,
      ...draftShifts.filter((s) => s.employees.length === 0),
    ];
    return { allShifts, allUnassignedShifts };
  }, [shifts, unassignedShifts, draftShifts]);

  /**
   * Memoized shift lookup by employee and date
   * Creates a Map with keys in format "employeeId-date" for quick shift access
   */
  const shiftsByEmployeeAndDate = useMemo(() => {
    const lookup = new Map<string, ShiftWithEmployees[]>();

    allShifts.forEach((shift) => {
      shift.employees?.forEach((empShift) => {
        if (empShift.employee) {
          const key = `${empShift.employee.id}-${shift.date}`;
          if (!lookup.has(key)) {
            lookup.set(key, []);
          }
          lookup.get(key)!.push(shift);
        }
      });
    });

    return lookup;
  }, [allShifts]);

  /**
   * Memoized unassigned shifts by date
   * Creates a Map with date keys for quick unassigned shift access
   */
  const unassignedShiftsByDate = useMemo(() => {
    const lookup = new Map<string, ShiftWithEmployees[]>();

    allUnassignedShifts.forEach((shift) => {
      if (!lookup.has(shift.date)) {
        lookup.set(shift.date, []);
      }
      lookup.get(shift.date)!.push(shift);
    });

    return lookup;
  }, [allUnassignedShifts]);

  /**
   * Handler for moving shifts to specific cells
   * @param shift - The shift to move
   * @param employeeId - Target employee ID
   * @param date - Target date
   */
  const handleMoveToCell = useCallback(
    (shift: ShiftWithEmployees, employeeId: number, date: string) => {
      console.log(
        `ScheduleGrid: Moving shift ${shift.id} to employee ${employeeId} on ${date}`
      );
      onMoveShift(shift, employeeId, date);
    },
    [onMoveShift]
  );

  /**
   * Handler for swapping two shifts
   * @param targetShift - The shift being targeted for swap
   * @param sourceShift - The shift being moved
   */
  const handleSwapShifts = useCallback(
    (targetShift: ShiftWithEmployees, sourceShift: ShiftWithEmployees) => {
      console.log(
        `ScheduleGrid: Swapping shifts ${sourceShift.id} and ${targetShift.id}`
      );
      onSwapShifts(targetShift, sourceShift);
    },
    [onSwapShifts]
  );

  /**
   * UnassignedDropZone Component
   * Drop target for converting assigned shifts to unassigned shifts
   * Uses forwardRef to properly handle react-dnd drop ref with TypeScript
   */
  const UnassignedDropZone: React.FC<{
    date: string;
    children: React.ReactNode;
  }> = ({ date, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop(
      () => ({
        accept: [
          ItemTypes.SHIFT,
          ItemTypes.UNASSIGNED_SHIFT,
          ItemTypes.DRAFT_SHIFT,
        ],
        drop: (item: DragItem, monitor) => {
          if (!monitor.didDrop()) {
            console.log(
              `UnassignedDropZone: Converting shift ${item.shift.id} to unassigned on ${date}`
            );
            // Handle conversion to unassigned shift
            return {
              targetType: "unassigned_zone",
              date,
              dropped: true,
            };
          }
          return undefined;
        },
        canDrop: (item: DragItem) => {
          // Only allow assigned shifts to be unassigned
          return item.shift.employees.length > 0;
        },
        collect: (monitor) => ({
          isOver: !!monitor.isOver({ shallow: true }),
          canDrop: !!monitor.canDrop(),
        }),
      }),
      [date]
    );

    /**
     * DropTarget component with forwardRef to handle react-dnd ref properly
     * This resolves the TypeScript type compatibility issue
     */
    const DropTarget = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
      ({ children }, ref) => (
        <div ref={ref}>{children}</div>
      )
    );
    DropTarget.displayName = 'DropTarget';

    // Use a callback ref to ensure compatibility with React's ref type
    const dropRef = useCallback((node: HTMLDivElement | null) => {
      if (node) {
        drop(node);
      }
    }, [drop]);
    return <DropTarget ref={dropRef}>{children}</DropTarget>;
  };

  return (
    <div className="rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        {/* Grid container with dynamic columns based on days in view */}
        <div
          className="grid min-w-max"
          style={{
            gridTemplateColumns: `200px repeat(${daysInView.length}, minmax(160px, 1fr))`,
          }}
        >
          {/* Table Header - Employee Column */}
          <div className="bg-teal-700 p-3 font-semibold text-white border-r border-gray-200 flex items-center sticky left-0 z-20">
            <MdDragIndicator className="text-white mr-2 text-lg" />
            <span>Employee</span>
          </div>

          {/* Date Headers - Display each day in view with visual indicators */}
          {daysInView.map((day) => {
            const isToday = dayjs().isSame(day, "day");
            const isWeekend = [0, 6].includes(day.day());

            return (
              <div
                key={day.format("YYYY-MM-DD")}
                className={`p-3 text-center font-semibold border-b border-r border-gray-200 transition-colors ${
                  isToday
                    ? "bg-teal-50 text-teal-700"
                    : isWeekend
                    ? "bg-gray-50 text-gray-600"
                    : "bg-white text-gray-700"
                }`}
              >
                <div className="text-sm font-medium text-slate-500">
                  {day.format("ddd")}
                </div>
                <div className="text-xs text-slate-400">
                  {day.format("MMM D")}
                </div>
                {/* Today indicator dot */}
                {isToday && (
                  <div className="w-2 h-2 bg-teal-500 rounded-full mx-auto mt-1"></div>
                )}
              </div>
            );
          })}

          {/* Unassigned Shifts Row Header */}
          <div
            className="flex items-center gap-2 p-3 border-b border-r border-gray-200 bg-teal-50 sticky left-0 z-10 group transition-all"
            onMouseEnter={() => setIsUnassignedHovered(true)}
            onMouseLeave={() => setIsUnassignedHovered(false)}
            style={{
              backgroundImage: isUnassignedHovered
                ? `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(59, 130, 246, 0.1) 10px,
                    rgba(59, 130, 246, 0.1) 20px
                  )`
                : "none",
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-teal-800 transition-colors">
                UNASSIGNED SHIFTS
              </div>
              <div className="text-xs text-teal-600 transition-colors">
                {isUnassignedHovered
                  ? "Drop shifts here to unassign"
                  : "Drag to assign to employees"}
              </div>
            </div>
            {/* Unassigned shifts count badge */}
            <div className="text-xs text-teal-500 font-medium px-2 py-1 bg-teal-100 rounded-full">
              {allUnassignedShifts.length}
            </div>
          </div>

          {/* Unassigned Shifts for Each Day */}
          {daysInView.map((day) => {
            const dateStr = day.format("YYYY-MM-DD");
            const isToday = dayjs().isSame(day, "day");
            const isWeekend = [0, 6].includes(day.day());
            const dayUnassignedShifts =
              unassignedShiftsByDate.get(dateStr) || [];

            return (
              <UnassignedDropZone key={`unassigned-${dateStr}`} date={dateStr}>
                <div
                  className={`p-2 border-b border-r border-gray-200 min-h-20 group transition-all ${
                    isToday
                      ? "bg-teal-50/70"
                      : isWeekend
                      ? "bg-gray-50/50"
                      : "bg-teal-50/30"
                  } ${isUnassignedHovered ? "bg-blue-50" : ""}`}
                  onMouseEnter={() => setIsUnassignedHovered(true)}
                  onMouseLeave={() => setIsUnassignedHovered(false)}
                  style={{
                    backgroundImage: isUnassignedHovered
                      ? `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 10px,
                          rgba(59, 130, 246, 0.1) 10px,
                          rgba(59, 130, 246, 0.1) 20px
                        )`
                      : "none",
                  }}
                >
                  <div className="space-y-1 h-full flex flex-col">
                    {/* Empty state with create button */}
                    {dayUnassignedShifts.length === 0 && (
                      <Tooltip title="Create unassigned shift">
                        <div
                          className="flex-1 flex flex-col items-center justify-center text-center p-2 rounded-lg h-full min-h-[60px] 
                          border border-dashed border-gray-200 hover:border-teal-300 hover:bg-teal-100 transition-all cursor-pointer 
                          group-hover:border-2 group-hover:border-teal-400"
                          onClick={() => onCreateNewShift(dateStr, true)}
                        >
                          <PlusIcon className="w-4 h-4 mb-1 text-gray-400 group-hover:text-teal-500 transition-colors" />
                          <span className="text-xs font-medium text-gray-500 group-hover:text-teal-700 transition-colors">
                            {isUnassignedHovered ? "Create New" : ""}
                          </span>
                        </div>
                      </Tooltip>
                    )}

                    {/* Display unassigned shifts for this date */}
                    {dayUnassignedShifts.map((shift) => (
                      <ShiftCard
                        key={shift.id}
                        shift={shift}
                        onDrop={handleSwapShifts}
                        onDelete={onDeleteShift}
                        onEdit={onEditShift}
                        date={dateStr}
                      />
                    ))}

                    {/* Add another shift button (visible when shifts exist) */}
                    {dayUnassignedShifts.length > 0 && (
                      <Tooltip title="Add another unassigned shift">
                        <button
                          onClick={() => onCreateNewShift(dateStr, true)}
                          className="w-full text-xs text-teal-600 hover:text-teal-700 flex items-center justify-center mt-auto 
                          transition-colors group-hover:bg-teal-50 group-hover:py-2 group-hover:rounded-md"
                          disabled={loading}
                        >
                          <PlusIcon className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            Add shift
                          </span>
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </UnassignedDropZone>
            );
          })}

          {/* Employee Rows - One row per employee */}
          {employees.map((employee) => (
            <React.Fragment key={employee.id}>
              {/* Employee Info Cell - Sticky left column */}
              <div className="flex items-center gap-3 p-3 border-b border-r border-gray-200 bg-white sticky left-0 z-10 group hover:bg-gray-50 transition-colors">
                <Avatar
                  className="bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-sm flex-shrink-0"
                  size="default"
                  style={{ minWidth: "36px" }}
                  src={employee.profile_image_url}
                >
                  {/* Fallback avatar initials if no image */}
                  {!employee.profile_image_url &&
                    getEmployeeFullName(employee)
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate text-gray-800">
                    {getEmployeeFullName(employee)}
                  </div>
                  <div className="text-xs truncate text-gray-500">
                    {employee.position}
                  </div>
                </div>

                {/* Employee shift count indicator */}
                <div className="text-xs text-gray-400 font-medium">
                  {daysInView.reduce((count, day) => {
                    const dateStr = day.format("YYYY-MM-DD");
                    const employeeShifts =
                      shiftsByEmployeeAndDate.get(
                        `${employee.id}-${dateStr}`
                      ) || [];
                    return count + employeeShifts.length;
                  }, 0)}
                </div>
              </div>

              {/* Shift Cells for Each Day - One cell per day per employee */}
              {daysInView.map((day) => {
                const dateStr = day.format("YYYY-MM-DD");
                const isToday = dayjs().isSame(day, "day");
                const isWeekend = [0, 6].includes(day.day());
                const employeeShifts =
                  shiftsByEmployeeAndDate.get(`${employee.id}-${dateStr}`) ||
                  [];

                return (
                  <div
                    key={`${employee.id}-${dateStr}`}
                    className={`p-2 border-b border-r border-gray-200 min-h-20 transition-colors ${
                      isToday
                        ? "bg-teal-50/50"
                        : isWeekend
                        ? "bg-gray-50/50"
                        : "bg-white"
                    }`}
                  >
                    <div className="space-y-1 h-full flex flex-col">
                      {employeeShifts.length === 0 ? (
                        // Empty cell with add functionality
                        <EmptyShiftCell
                          employeeId={employee.id}
                          date={dateStr}
                          isToday={isToday}
                          onAdd={onAddShift}
                          onMove={handleMoveToCell}
                        />
                      ) : (
                        // Cell with existing shifts
                        <div className="relative h-full space-y-1">
                          {employeeShifts.map((shift) => (
                            <ShiftCard
                              key={shift.id}
                              shift={shift}
                              onDrop={handleSwapShifts}
                              onDelete={onDeleteShift}
                              onEdit={onEditShift}
                              employeeId={employee.id}
                              date={dateStr}
                            />
                          ))}
                          {/* Shift count badge for multiple shifts */}
                          {employeeShifts.length > 1 && (
                            <div className="absolute top-1 right-1 bg-teal-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                              {employeeShifts.length}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Loading overlay - shown when loading state is true */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-30">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="text-gray-600">Updating schedule...</span>
          </div>
        </div>
      )}
    </div>
  );
};