import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Button, Dropdown } from "antd";
import { MoreVertical } from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { ShiftWithEmployees } from "@/lib/types/shift";

const ItemTypes = {
  SHIFT: "shift",
  EMPTY_CELL: "empty_cell",
};

const roleColors: Record<string, string> = {
  "Cleaning Supervisor": "#3B82F6",
  Janitor: "#10B981",
  Manager: "#F59E0B",
  Default: "#6B7280",
};

interface DragItem {
  type: string;
  shift: ShiftWithEmployees;
}

interface EmptyCellDragItem {
  type: string;
  shift: ShiftWithEmployees;
  targetEmployeeId: number;
  targetDate: string;
}

interface ShiftCardProps {
  shift: ShiftWithEmployees;
  onDrop: (targetShift: ShiftWithEmployees, sourceShift: ShiftWithEmployees) => void;
  onDelete: (shiftId: number) => void;
  onEdit: (shift: ShiftWithEmployees) => void;
}

// Helper Functions
const getEmployeeFromShift = (shift: ShiftWithEmployees) => {
  if (!shift.employees || shift.employees.length === 0) return null;
  return shift.employees[0].employee || null;
};

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  onDrop,
  onDelete,
  onEdit,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SHIFT,
    item: { shift },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.SHIFT, ItemTypes.EMPTY_CELL],
    drop: (item: DragItem | EmptyCellDragItem) => {
      if (item.type === ItemTypes.SHIFT && item.shift.id !== shift.id) {
        onDrop(shift, item.shift);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Create a ref and apply both drag and drop to it
  const ref = useRef<HTMLDivElement>(null);
  drag(drop(ref));

  // Safe access to employee data
  if (
    !shift.employees ||
    shift.employees.length === 0 ||
    !shift.employees[0].employee
  ) {
    return null;
  }

  const shiftEmployeeData = shift.employees[0];
  const employee = shiftEmployeeData.employee;
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
      ref={ref}
      className={`relative group p-3 mb-2 shadow-xs transition-all z-10
                 border border-gray-100 hover:border-gray-200 bg-white hover:shadow-sm
                 hover:translate-y-[0px] transform duration-150
                 cursor-grab active:cursor-grabbing ${
                   isDragging ? "opacity-50" : "opacity-100"
                 } ${isOver ? "border-2 border-blue-300" : ""}`}
      style={{
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
        <div class="p-1 bg-white border border-gray-200 max-w-xs">
          <div class="font-semibold text-gray-800">${employeeName}</div>
          <div class="text-sm text-gray-600 mb-1">${
            employee.position || "No Position"
          }</div>
          <div class="flex items-center gap-2 text-sm text-gray-700 mb-1">
            <span class="inline-block w-2 h-2 rounded-full" style="background-color: ${roleColor}"></span>
            ${timeRange}
          </div>
          <div class="text-xs text-gray-500">${clientName}</div>
        </div>
      `}
    >
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-medium text-gray-500">{timeRange}</span>
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