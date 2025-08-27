import React from 'react';
import { DateRange } from '@/lib/types/dashboard';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  value,
  onChange,
  className = '',
}) => {
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
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="date"
        value={value.from.toISOString().split('T')[0]}
        onChange={handleFromChange}
        className="border border-teal-600 text-slate-900 rounded p-2 text-sm"
        max={value.to.toISOString().split('T')[0]}
      />
      <span className="text-teal-700">to</span>
      <input
        type="date"
        value={value.to.toISOString().split('T')[0]}
        onChange={handleToChange}
        className="border border-teal-600 text-slate-900 rounded p-2 text-sm"
        min={value.from.toISOString().split('T')[0]}
      />
    </div>
  );
};

export default DateRangeSelector;