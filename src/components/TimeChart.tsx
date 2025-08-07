'use client';

import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { subDays, format, isWithinInterval } from 'date-fns';

ChartJS.register(...registerables);

export default function TimeChart({ logs }: { logs: ClockInOutLog[] }) {
  // Date range state (default: last 7 days)
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    subDays(new Date(), 7),
    new Date(),
  ]);
  const [startDate, endDate] = dateRange;

  // Filter logs by selected date range
  const filteredLogs = logs.filter(log => {
    if (!startDate || !endDate) return true;
    const logDate = new Date(log.clockIn);
    return isWithinInterval(logDate, { start: startDate, end: endDate });
  });

  // Process data for chart
  const dailyHours = filteredLogs.reduce((acc, log) => {
    const date = format(new Date(log.clockIn), 'MMM dd');
    const hours = log.duration ? log.duration / 60 : 0; // Convert minutes to hours
    acc[date] = (acc[date] || 0) + hours;
    return acc;
  }, {} as Record<string, number>);

  const chartData = {
    labels: Object.keys(dailyHours),
    datasets: [{
      label: 'Hours Worked',
      data: Object.values(dailyHours),
      backgroundColor: '#3b82f6',
      borderRadius: 4,
    }]
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Hours Worked</h3>
        <div className="flex items-center gap-2">
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            maxDate={new Date()}
            className="border rounded p-2 text-sm w-64"
            placeholderText="Select date range"
          />
          {startDate && endDate && (
            <button 
              onClick={() => setDateRange([null, null])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <Bar
        data={chartData}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Hours' },
              ticks: { stepSize: 2 }
            },
            x: { grid: { display: false } }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.raw?.toFixed(1)} hours`
              }
            }
          }
        }}
      />
    </div>
  );
}