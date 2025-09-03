import React from 'react';
import { DateRange } from '@/lib/types/dashboard';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presetRanges = [
  { 
    label: 'Today', 
    value: 'today',
    getRange: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return {
        from: today,
        to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    }
  },
  { 
    label: 'This Week', 
    value: 'week',
    getRange: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return {
        from: startOfWeek,
        to: endOfWeek
      };
    }
  },
  { 
    label: 'This Month', 
    value: 'month',
    getRange: () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return {
        from: startOfMonth,
        to: endOfMonth
      };
    }
  },
  { 
    label: 'Custom', 
    value: 'custom',
    getRange: () => ({ from: new Date(), to: new Date() }) // Not used for custom
  }
];

export const DateRangeAttendance: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [showCustomPicker, setShowCustomPicker] = React.useState(false);

  const handlePresetRange = (rangeValue: string) => {
    if (rangeValue === 'custom') {
      setShowCustomPicker(true);
      return;
    }
    
    setShowCustomPicker(false);
    const range = presetRanges.find(r => r.value === rangeValue);
    if (range && range.value !== 'custom') {
      onChange(range.getRange());
    }
  };

  const isRangeActive = (rangeValue: string) => {
    if (rangeValue === 'custom') return showCustomPicker;
    
    const range = presetRanges.find(r => r.value === rangeValue);
    if (!range || range.value === 'custom') return false;
    
    const presetRange = range.getRange();
    return (
      value.from.getTime() === presetRange.from.getTime() &&
      value.to.getTime() === presetRange.to.getTime()
    );
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.valueAsDate;
    if (newDate) {
      newDate.setHours(0, 0, 0, 0);
      onChange({
        ...value,
        from: newDate,
      });
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.valueAsDate;
    if (newDate) {
      newDate.setHours(23, 59, 59, 999);
      onChange({
        ...value,
        to: newDate,
      });
    }
  };

  // Format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${className}`}>
      {/* Date Range Display */}
      <div>
        <p className="text-base font-semibold text-slate-800">
          {value.from.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            // year: "numeric",
          })}{" "}
          -{" "}
          {value.to.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Preset Range Buttons and Custom Picker */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="flex gap-2">
          {presetRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => handlePresetRange(range.value)}
              className={`text-xs px-3 py-1 rounded-full ${
                isRangeActive(range.value)
                  ? "bg-teal-100 text-slate-800"
                  : "bg-[#e5f0f0] text-slate-600 hover:bg-teal-700 hover:text-white"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Custom Date Picker - Only shown when custom is selected */}
        {showCustomPicker && (
          <div className="flex flex-col sm:flex-row items-center gap-2 ">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <input
                type="date"
                value={formatDateForInput(value.from)}
                onChange={handleFromChange}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-full"
                max={formatDateForInput(value.to)}
              />
            </div>
            
            <span className="text-gray-500 text-sm hidden sm:inline">to</span>
            <span className="text-gray-500 text-sm sm:hidden">-</span>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={formatDateForInput(value.to)}
                onChange={handleToChange}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 w-full"
                min={formatDateForInput(value.from)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangeAttendance;