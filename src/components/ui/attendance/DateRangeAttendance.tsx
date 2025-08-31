import React from 'react';
import { DateRange } from '@/lib/types/dashboard';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const quickFilters = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Custom', value: 'custom' },
];

export const DateRangeAttendance: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [activeFilter, setActiveFilter] = React.useState('week');
  const [showCustomPicker, setShowCustomPicker] = React.useState(false);

  const handleQuickFilter = (filter: string) => {
    setActiveFilter(filter);
    setShowCustomPicker(filter === 'custom');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        onChange({
          from: today,
          to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        });
        break;
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        onChange({
          from: startOfWeek,
          to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        });
        break;
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        onChange({
          from: startOfMonth,
          to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        });
        break;
      case 'custom':
        // Keep current selection for custom
        break;
    }
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      from: e.target.valueAsDate || value.from,
    });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...value,
      to: e.target.valueAsDate || value.to,
    });
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
        
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleQuickFilter(filter.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter.value
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Custom Date Picker - Only shown when custom is selected */}
      {showCustomPicker && (
        <div className="flex flex-row sm:flex-row items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            <input
              type="date"
              value={value.from.toISOString().split('T')[0]}
              onChange={handleFromChange}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              max={value.to.toISOString().split('T')[0]}
            />
          </div>
          
          <span className="text-gray-500 text-sm">to</span>
          
          <div className="flex items-center gap-2 flex-1">
            <input
              type="date"
              value={value.to.toISOString().split('T')[0]}
              onChange={handleToChange}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              min={value.from.toISOString().split('T')[0]}
            />
          </div>
        </div>
      )}

      {/* Current Range Display */}
      {!showCustomPicker && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {value.from.toLocaleDateString()} - {value.to.toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default DateRangeAttendance;