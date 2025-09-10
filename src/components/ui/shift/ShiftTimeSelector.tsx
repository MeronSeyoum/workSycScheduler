// ShiftTimeSelector.tsx
import React from "react";

export interface ShiftTimeOption {
  label: string;
  value: { start: string; end: string };
}

interface ShiftTimeSelectorProps {
  onSelect: (shiftTime: { start: string; end: string }) => void;
  selectedTime?: { start: string; end: string };
  className?: string;
}

// Define SHIFT_TIME_OPTIONS inside the component file
const SHIFT_TIME_OPTIONS: ShiftTimeOption[] = [
  { label: "4 hours (8AM-12PM)", value: { start: "08:00", end: "12:00" } },
  { label: "6 hours (8AM-2PM)", value: { start: "08:00", end: "14:00" } },
  { label: "8 hours (8AM-4PM)", value: { start: "08:00", end: "16:00" } },
  { label: "10 hours (8AM-6PM)", value: { start: "08:00", end: "18:00" } },
  { label: "12 hours (8AM-8PM)", value: { start: "08:00", end: "20:00" } },
];

export const ShiftTimeSelector: React.FC<ShiftTimeSelectorProps> = ({
  onSelect,
  selectedTime,
  className = "",
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {SHIFT_TIME_OPTIONS.map((option) => {
        const isSelected = 
          selectedTime?.start === option.value.start && 
          selectedTime?.end === option.value.end;
        
        return (
          <button
            key={option.label}
            onClick={() => onSelect(option.value)}
            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
              isSelected
                ? "bg-teal-100 border-teal-500 text-teal-700 font-medium"
                : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
            }`}
            title={`${option.label} shift`}
          >
            {option.label.split(' ')[0]} {/* Show just the duration */}
          </button>
        );
      })}
    </div>
  );
};