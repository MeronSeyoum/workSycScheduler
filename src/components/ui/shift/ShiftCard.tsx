import React, { useRef, useState, useMemo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Button, Dropdown, MenuProps, Modal } from "antd";
import { MoreVertical } from "lucide-react";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import dayjs from "dayjs";
import { ShiftWithEmployees } from "@/lib/types/shift";
import { 
  createDragItem, 
  getShiftColumnId, 
  getShiftDragType, 
  trackDragOperation,
  ItemTypes,
  type DragItem as UtilityDragItem,
  type DropResult 
} from "@/lib/utils/dragDropUtils";

// Map positions to Tailwind color classes
const roleColorClasses: Record<string, { border: string; bg: string }> = {
  "Cleaning Supervisor": {
    border: "border-blue-500",
    bg: "bg-blue-50"
  },
  "Window Cleaner": {
    border: "border-purple-500",
    bg: "bg-purple-50"
  },
  Janitor: {
    border: "border-green-500",
    bg: "bg-green-50"
  },
  Manager: {
    border: "border-orange-500",
    bg: "bg-orange-50"
  },
  Default: {
    border: "border-gray-500",
    bg: "bg-gray-50"
  },
};

interface ShiftCardProps {
  shift: ShiftWithEmployees;
  onDrop: (targetShift: ShiftWithEmployees, sourceShift: ShiftWithEmployees) => void;
  onDelete: (shiftId: number) => void;
  onEdit: (shift: ShiftWithEmployees) => void;
  employeeId?: number;
  date?: string;
}

/**
 * Formats time string to 12-hour AM/PM format
 * @param timeString - Time in HH:mm format (24-hour)
 * @returns Formatted time in 12-hour format with AM/PM
 */
const formatTo12Hour = (timeString: string): string => {
  const time = dayjs(timeString, "HH:mm");
  return time.format("h:mm A");
};

/**
 * Calculates total hours between start and end time
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Total hours as a decimal number
 */
const calculateTotalHours = (startTime: string, endTime: string): number => {
  const start = dayjs(startTime, "HH:mm");
  const end = dayjs(endTime, "HH:mm");
  return end.diff(start, "minutes") / 60;
};

/**
 * Formats total hours for display
 * @param totalHours - Total hours as decimal
 * @returns Formatted string like "8h" or "7.5h"
 */
const formatTotalHours = (totalHours: number): string => {
  if (totalHours === Math.floor(totalHours)) {
    return `${totalHours}h`;
  }
  return `${totalHours}h`;
};

export const ShiftCard: React.FC<ShiftCardProps> = ({
  shift,
  onDrop,
  onDelete,
  onEdit,
  employeeId,
  date,
}) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Use utility functions for consistent behavior
  const itemType = useMemo(() => getShiftDragType(shift), [shift]);
  const originalColumn = useMemo(() => 
    getShiftColumnId(shift, employeeId, date), 
    [shift, employeeId, date]
  );

  // Memoized time calculations
  const timeInfo = useMemo(() => {
    const startTime12h = formatTo12Hour(shift.start_time);
    const endTime12h = formatTo12Hour(shift.end_time);
    const totalHours = calculateTotalHours(shift.start_time, shift.end_time);
    const formattedTotalHours = formatTotalHours(totalHours);
    
    return {
      startTime12h,
      endTime12h,
      totalHours,
      formattedTotalHours,
      timeRange: `${startTime12h} - ${endTime12h}`,
      timeRangeWithTotal: `${startTime12h} - ${endTime12h} (${formattedTotalHours})`
    };
  }, [shift.start_time, shift.end_time]);

  // Drag configuration
  const [{ isDragging }, drag] = useDrag(() => ({
    type: itemType,
    item: (): UtilityDragItem => createDragItem(shift, employeeId, date),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult() as DropResult;
      if (item && dropResult && dropResult.dropped) {
        trackDragOperation(
          dropResult.targetType === 'shift_card' ? 'swap' : 'move',
          item.originalColumn || '',
          dropResult.targetType === 'shift_card' 
            ? getShiftColumnId(dropResult.targetShift!) 
            : `${dropResult.employeeId}-${dropResult.date}`,
          shift.id
        );
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [shift, employeeId, date, itemType]);

  // Drop configuration
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [ItemTypes.SHIFT, ItemTypes.UNASSIGNED_SHIFT, ItemTypes.DRAFT_SHIFT],
    drop: (item: UtilityDragItem, monitor) => {
      if (!monitor.didDrop() && item.shift.id !== shift.id) {
        onDrop(shift, item.shift);
        return { 
          targetType: 'shift_card' as const, 
          targetShift: shift, 
          dropped: true 
        };
      }
      return undefined;
    },
    canDrop: (item: UtilityDragItem) => 
      item.shift.id !== shift.id && item.originalColumn !== originalColumn,
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),
  }), [shift, originalColumn, onDrop]);

  // Combine drag and drop refs
  drag(drop(ref));

  // Memoized calculations
  const hasEmployees = shift.employees?.length > 0;
  const employee = hasEmployees ? shift.employees[0]?.employee : null;
  const position = employee?.position || "";
  const roleColor = roleColorClasses[position] || roleColorClasses.Default;

  const employeeName = !hasEmployees
    ? shift.name || "Unassigned Shift"
    : employee?.user
    ? `${employee.user.first_name} ${employee.user.last_name}`
    : "Unknown Employee";

  const positionName = !hasEmployees
    ? shift.name || "Unassigned"
    : employee?.position || "No Position";

  const clientName = shift.client?.business_name || "Unknown Client";

  // Dropdown menu items
  const dropdownItems: MenuProps["items"] = [
    {
      key: "edit",
      label: "Edit Time",
      icon: <FaEdit className="text-blue-500" />,
      onClick: () => onEdit(shift),
    },
    {
      key: "assign",
      label: "Assign to Employee",
      icon: <FaUserPlus className="text-green-500" />,
      onClick: () => setShowAssignModal(true),
      style: { display: !hasEmployees ? "block" : "none" },
    },
    { type: "divider" },
    {
      key: "delete",
      label: "Delete Shift",
      icon: <FaTrash className="text-red-500" />,
      danger: true,
      onClick: () => {
        if (window.confirm("Are you sure you want to delete this shift?")) {
          onDelete(shift.id);
        }
      },
    },
  ];

  // Style calculations using Tailwind classes
  const getCardStyles = () => {
    const baseClasses = `group p-2 shadow-sm transition-all duration-200 border-l-4 rounded-sm relative cursor-grab active:cursor-grabbing transform hover:shadow-md ${roleColor.bg} ${roleColor.border}`;

    if (isDragging) {
      return `${baseClasses} opacity-50 scale-105 shadow-lg z-10`;
    }
    if (isOver && canDrop) {
      return `${baseClasses} border-2 border-teal-300 bg-teal-50 shadow-md scale-105`;
    }
    if (isOver && !canDrop) {
      return `${baseClasses} border-2 border-red-300 bg-red-50`;
    }
    return hasEmployees 
      ? `${baseClasses} border-gray-100 hover:border-gray-200`
      : `${baseClasses} border-dashed border-gray-200 hover:border-gray-300`;
  };

  return (
    <>
      <div
        ref={ref}
        className={getCardStyles()}
        data-tooltip-id={`shift-${shift.id}`}
        data-tooltip-html={`
          <div class="bg-white max-w-xs">
            <div class="font-semibold text-gray-800 mb-1">${employeeName}</div>
            ${shift.status === "draft"
              ? '<div class="text-xs text-yellow-600 font-medium mb-1 px-2 py-1 bg-yellow-100 rounded-full inline-block">DRAFT</div>'
              : ""
            }
            <div class="text-sm text-gray-600 mb-2">${positionName}</div>
            <div class="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <span class="inline-block w-3 h-3 rounded-full ${roleColor.bg} border ${roleColor.border}"></span>
              <span class="font-medium">${timeInfo.timeRangeWithTotal}</span>
            </div>
            <div class="text-xs text-gray-500">${clientName}</div>
          </div>
        `}
        data-testid={`shift-card-${shift.id}`}
      >
        {shift.status === "draft" && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white shadow-sm" />
        )}

        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-700">
                  {timeInfo.timeRange}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">
                  {timeInfo.formattedTotalHours}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-800 mb-1 truncate">
              {positionName}
            </div>

            {!hasEmployees && (
              <div className="text-xs text-gray-500 truncate">
                {clientName}
              </div>
            )}
          </div>

          <Dropdown
            menu={{ items: dropdownItems }}
            trigger={["click"]}
            placement="bottomRight"
            className="ml-2"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreVertical size={14} />}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>

        {isOver && canDrop && (
          <div className="absolute inset-0 bg-teal-100 opacity-30 rounded-lg border-2 border-teal-300 border-dashed pointer-events-none" />
        )}
        
        {isOver && !canDrop && (
          <div className="absolute inset-0 bg-red-50 opacity-30 rounded-lg border-2 border-red-300 border-dashed pointer-events-none" />
        )}
      </div>

      <Tooltip
        id={`shift-${shift.id}`}
        className="!bg-white !opacity-100 !shadow-lg !border !border-gray-200 !rounded-lg !z-50"
        style={{ zIndex: 9999 }}
      />

      <Modal
        title="Assign Shift to Employee"
        open={showAssignModal}
        onOk={() => setShowAssignModal(false)}
        onCancel={() => setShowAssignModal(false)}
        okText="Close"
      >
        <p>Shift assignment functionality would be implemented here.</p>
      </Modal>
    </>
  );
};