import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange, Range } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface DateRangePickerProps {
  value: {
    start: Date;
    end: Date;
  };
  onChange: (range: { start: Date; end: Date }) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSelect = (ranges: { [key: string]: Range }) => {
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate) {
      onChange({ start: startDate, end: endDate });
      setShowCalendar(false);
    }
  };

  const selectionRange: Range = {
    startDate: value.start,
    endDate: value.end,
    key: 'selection',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <CalendarIcon className="h-4 w-4 text-gray-400" />
        <span>
          {format(value.start, 'MMM d, yyyy')} - {format(value.end, 'MMM d, yyyy')}
        </span>
      </button>
      {showCalendar && (
        <div className="absolute right-0 mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg">
          <DateRange
            ranges={[selectionRange]}
            onChange={handleSelect}
            months={2}
            direction="horizontal"
          />
        </div>
      )}
    </div>
  );
}