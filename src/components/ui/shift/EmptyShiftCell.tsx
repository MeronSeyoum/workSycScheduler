import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { PlusIcon } from "lucide-react";
import { ShiftWithEmployees } from "@/lib/types/shift";
import { validateDragOperation } from "@/lib/utils/dragDropUtils";

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

interface EmptyShiftCellProps {
  employeeId: number;
  date: string;
  isToday: boolean;
  onAdd: (employeeId: number, date: string) => void;
  onMove: (shift: ShiftWithEmployees, employeeId: number, date: string) => void;
}

export const EmptyShiftCell: React.FC<EmptyShiftCellProps> = React.memo(({
  employeeId,
  date,
  isToday,
  onAdd,
  onMove,
}) => {
  const cellId = `${employeeId}-${date}`;
  
// In EmptyShiftCell.tsx - Add proper validation
const [{ isOver, canDrop }, drop] = useDrop(() => ({
  accept: [ItemTypes.SHIFT, ItemTypes.UNASSIGNED_SHIFT, ItemTypes.DRAFT_SHIFT],
  drop: (item: DragItem, monitor) => {
    if (!monitor.didDrop()) {
      // Validate the drop is allowed
      if (item.originalColumn !== cellId) {
        console.log(`EmptyShiftCell: Dropping shift ${item.shift.id} to employee ${employeeId} on ${date}`);
        onMove(item.shift, employeeId, date);
        return { 
          targetType: 'empty_cell',
          employeeId, 
          date,
          dropped: true 
        };
      }
    }
    return undefined;
  },
canDrop: (item: DragItem) => {
  return validateDragOperation(item.originalColumn || '', cellId); // Use the utility function
},
  collect: (monitor) => ({
    isOver: !!monitor.isOver({ shallow: true }),
    canDrop: !!monitor.canDrop(),
  }),
}), [employeeId, date, cellId, onMove]);

  const ref = useRef<HTMLDivElement>(null);
  drop(ref);

  const getDropIndicatorStyle = () => {
    if (isOver && canDrop) {
      return "bg-teal-100 border-teal-300 border-2 border-solid";
    }
    if (isOver && !canDrop) {
      return "bg-red-50 border-red-300 border-2 border-solid";
    }
    return "";
  };

  return (
    <div
      ref={ref}
      className={`
        flex-1 flex flex-col items-center justify-center text-center rounded-sm  h-full min-h-[60px] 
        transition-all duration-200 cursor-pointer hover:shadow-sm relative
        ${isToday
          ? "border-2 border-blue-100 bg-blue-50 hover:bg-teal-100"
          : "border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }
        ${getDropIndicatorStyle()}
      `}
      onClick={() => onAdd(employeeId, date)}
      data-testid={`empty-cell-${employeeId}-${date}`}
    >
      <PlusIcon
        className={`w-4 h-4 mb-1 transition-colors ${
          isToday ? "text-blue-500" : "text-gray-400"
        }`}
      />
      <span
        className={`text-xs font-medium transition-colors ${
          isToday ? "text-blue-500" : "text-gray-400"
        }`}
      >
        {isToday ? "Add to today" : "Add shift"}
      </span>
      
      {/* Drop indicator overlay */}
      {isOver && canDrop && (
        <div className="absolute inset-0 bg-teal-100 opacity-50 rounded-lg border-2 border-teal-300 border-dashed pointer-events-none" />
      )}
      
      {isOver && !canDrop && (
        <div className="absolute inset-0 bg-red-50 opacity-50 rounded-lg border-2 border-red-300 border-dashed pointer-events-none" />
      )}
    </div>
  );
});

EmptyShiftCell.displayName = "EmptyShiftCell";