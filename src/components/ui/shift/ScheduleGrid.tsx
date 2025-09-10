import React from "react";
import { Avatar } from "antd";
import { PlusIcon } from "lucide-react";
import { MdDragIndicator } from "react-icons/md";
import dayjs, { Dayjs } from "dayjs";
import { ShiftCard } from "./ShiftCard";
import { EmptyShiftCell } from "./EmptyShiftCell";
import { ShiftWithEmployees } from "@/lib/types/shift";
import { Employee } from "@/lib/types/employee";

interface ScheduleGridProps {
  employees: Employee[];
  daysInView: Dayjs[];
  shifts: ShiftWithEmployees[];
  view: "day" | "week" | "month";
  loading: boolean;
  onAddShift: (employeeId: number, date: string) => void;
  onMoveShift: (shift: ShiftWithEmployees, employeeId: number, date: string) => void;
  onSwapShifts: (targetShift: ShiftWithEmployees, sourceShift: ShiftWithEmployees) => void;
  onDeleteShift: (shiftId: number) => void;
  onEditShift: (shift: ShiftWithEmployees) => void;
  getEmployeeFullName: (employee: Employee) => string;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  employees,
  daysInView,
  shifts,
  view,
  loading,
  onAddShift,
  onMoveShift,
  onSwapShifts,
  onDeleteShift,
  onEditShift,
  getEmployeeFullName,
}) => {
  return (
    <div className="rounded-md shadow-xs overflow-hidden bg-white border border-gray-200">
      <div className="overflow-x-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `200px repeat(${
              view === "week" ? 7 : 1
            }, minmax(150px, 1fr))`,
          }}
        >
          {/* Table Header */}
          <div className="bg-teal-600 p-3 font-semibold text-white border-r  left-0 flex items-center z-10">
            <MdDragIndicator className="text-teal-200 mr-2 text-lg" />
            <span>Employee</span>
          </div>

          {/* Date Headers */}
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

          {/* Employee Rows */}
          {employees.map((employee) => (
            <React.Fragment key={employee.id}>
              {/* Employee Info Cell */}
              <div className="flex items-center gap-3 p-3 border-b border-r border-gray-100 bg-white  left-0 hover:bg-gray-50 transition-colors shadow-sm z-0">
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

                <div className="min-w-0">
                  <div className="font-medium text-sm truncate text-gray-800">
                    {getEmployeeFullName(employee)}
                  </div>
                  <div className="text-xs truncate text-gray-500">
                    {employee.position}
                  </div>
                </div>
              </div>

              {/* Shift Cells for Each Day */}
              {daysInView.map((day) => {
                const dateStr = day.format("YYYY-MM-DD");
                const isToday = dayjs().isSame(day, "day");
                const isWeekend = [0, 6].includes(day.day());

                // Safe filtering of shifts for this employee and date
                const employeeShifts = shifts.filter((shift) => {
                  const hasEmployee = shift.employees?.some(
                    (e) => e.employee?.id === employee.id
                  );
                  return hasEmployee && shift.date === dateStr;
                });

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
                      {employeeShifts.length === 0 && (
                        <EmptyShiftCell
                          employeeId={employee.id}
                          date={dateStr}
                          isToday={isToday}
                          onAdd={onAddShift}
                          onMove={onMoveShift}
                        />
                      )}

                      {employeeShifts.map((shift) => (
                        <ShiftCard
                          key={shift.id}
                          shift={shift}
                          onDrop={onSwapShifts}
                          onDelete={onDeleteShift}
                          onEdit={onEditShift}
                        />
                      ))}

                      {employeeShifts.length > 0 && (
                        <button
                          onClick={() => onAddShift(employee.id, dateStr)}
                          className="w-full text-xs text-gray-400 hover:text-blue-500 flex items-center justify-center mt-auto transition-colors group py-1"
                          disabled={loading}
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
  );
};