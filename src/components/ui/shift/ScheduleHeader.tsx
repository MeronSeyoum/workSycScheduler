import React from "react";
import { Select, DatePicker } from "antd";
import { FaStore, FaCalendarAlt } from "react-icons/fa";
import  { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface LocationData {
  id: string;
  name: string;
}

interface ScheduleHeaderProps {
  selectedLocation: LocationData | null;
  dateRange: [Dayjs, Dayjs];
  view: "day" | "week" | "month";
  onViewChange: (view: "day" | "week" | "month") => void;
  onDateRangeChange: (dates: [Dayjs, Dayjs]) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  selectedLocation,
  dateRange,
  view,
  onViewChange,
  onDateRangeChange,
  onPrevious,
  onNext,
  onToday,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-xs border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-teal-50">
          <FaStore className="text-teal-600 text-xl" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-800">
            {selectedLocation?.name || "Shift Scheduler"}
          </h1>
          <p className="text-xs text-gray-500">
            {view === "day"
              ? dateRange[0].format("MMMM D, YYYY")
              : `${dateRange[0].format("MMM D")} - ${dateRange[1].format(
                  "MMM D, YYYY"
                )}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous week"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <button
            onClick={onToday}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Today
          </button>

          <button
            onClick={onNext}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Next week"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <Select
          value={view}
          onChange={onViewChange}
          className="w-32 rounded-lg"
          suffixIcon={<FaCalendarAlt className="text-gray-400" />}
        >
          <Option value="day">Day View</Option>
          <Option value="week">Week View</Option>
          <Option value="month">Month View</Option>
        </Select>

        <RangePicker
          value={dateRange}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              onDateRangeChange([dates[0]!, dates[1]!]);
            }
          }}
          className="w-64 rounded-lg [&_.ant-picker-input>input]:text-sm"
        />
      </div>
    </div>
  );
};