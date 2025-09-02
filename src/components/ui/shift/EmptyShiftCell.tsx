import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { PlusIcon } from "lucide-react";
import { ShiftWithEmployees } from "@/lib/types/shift";

const ItemTypes = {
  SHIFT: "shift",
};

interface DragItem {
  type: string;
  shift: ShiftWithEmployees;
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
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.SHIFT,
    drop: (item: DragItem) => {
      onMove(item.shift, employeeId, date);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const ref = useRef<HTMLDivElement>(null);
  drop(ref);

  return (
    <div
      ref={ref}
      className={`flex-1 flex flex-col items-center justify-center text-center p-2 rounded-lg h-full min-h-[60px] ${
        isToday
          ? "border-2 border-blue-300 bg-blue-50 hover:bg-blue-100"
          : "border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      } ${
        isOver ? "bg-blue-100 border-blue-300" : ""
      } transition-all cursor-pointer hover:shadow-xs`}
      onClick={() => onAdd(employeeId, date)}
    >
      <PlusIcon
        className={`w-4 h-4 mb-1 ${
          isToday ? "text-blue-500" : "text-gray-400"
        }`}
      />
      <span
        className={`text-xs font-medium ${
          isToday ? "text-blue-600" : "text-gray-500"
        }`}
      >
        {isToday ? "Add to today" : "Add shift"}
      </span>
      {isOver && (
        <div className="absolute inset-0 bg-blue-100 opacity-50 rounded-lg border-2 border-blue-300 border-dashed" />
      )}
    </div>
  );
});

EmptyShiftCell.displayName = "EmptyShiftCell";