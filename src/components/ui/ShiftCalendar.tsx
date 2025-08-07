'use client';

import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Shift {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

interface ShiftCalendarProps {
  shifts: Shift[];
  dateRange?: { from: Date; to: Date };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
}

export default function ShiftCalendar({ shifts, dateRange, onDateRangeChange }: ShiftCalendarProps) {
  const events = shifts.map(shift => ({
    id: shift.id,
    title: shift.title || 'Shift',
    start: new Date(shift.start),
    end: new Date(shift.end),
    resource: shift.resource
  }));

  return (
    <div className="h-full">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        defaultView="week"
        views={['day', 'week', 'month']}
        onRangeChange={(range) => {
          if (onDateRangeChange && Array.isArray(range) && range[0] instanceof Date) {
            onDateRangeChange({
              from: range[0],
              to: range[range.length - 1]
            });
          }
        }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: '#6366F1',
            borderRadius: '4px',
            border: 'none',
          },
        })}
      />
    </div>
  );
}