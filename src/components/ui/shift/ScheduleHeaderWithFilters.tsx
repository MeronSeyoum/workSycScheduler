// ScheduleHeaderWithFilters.tsx
import React, { useState } from "react";
import { Select, Button, Input } from "antd";
import {
  FaSearch,
  FaFilter,
  FaStore,
 
  FaRobot,
  FaClock,
  FaExchangeAlt,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCalendar,
  FaClock as FaClockIcon,
  FaCopy,
  FaCheckCircle,
  FaPrint,
  FaFileExport,
} from "react-icons/fa";
import { Badge } from "@/components/ui/common/badge";
import { Client } from "@/lib/types/client";
import dayjs, { Dayjs } from "dayjs";
import { ShiftTimeSelector } from "@/components/ui/shift/ShiftTimeSelector"; // Import the component

const { Option } = Select;

const departments = [
  "Manager",
  "Cleaning Supervisor",
  "General Cleaning",
  "Janitor",
  "Restroom Services",
];

interface LoadingState {
  shifts: boolean;
  employees: boolean;
  clients: boolean;
  general: boolean;
  aiScheduling: boolean;
}

interface LocationData {
  id: string;
  name: string;
}

interface ScheduleHeaderWithFiltersProps {
  clients: Client[];
  selectedLocation: LocationData | null;
  dateRange: [Dayjs, Dayjs];
  view: "day" | "week" | "month";
   bulkTemplatesCount: number;
  searchTerm: string;
  departmentFilter: string;
  loading: LoadingState;
  openShiftsCount: number;
  pendingSwapsCount: number;
  selectedShiftTime: { start: string; end: string };
  showShiftTimeSelector: boolean;
  onViewChange: (view: "day" | "week" | "month") => void;
  onDateRangeChange: (dates: [Dayjs, Dayjs]) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onLocationChange: (locationId: string) => void;
  onSearchChange: (searchTerm: string) => void;
  onDepartmentChange: (department: string) => void;
  onPrint: () => void;
  onExport: () => void;
  onOpenAIScheduler: () => void;
  onOpenShifts: () => void;
  onShiftSwaps: () => void;
  onShiftTimeSelect: (shiftTime: { start: string; end: string }) => void;
  onToggleShiftTimeSelector: () => void;
  onOpenBulkCreator: () => void;
  onOpenBulkApproval: () => void;
}

export const ScheduleHeaderWithFilters: React.FC<
  ScheduleHeaderWithFiltersProps
> = ({
  clients,
  selectedLocation,
  dateRange,
  view,
   bulkTemplatesCount,
  searchTerm,
  departmentFilter,
  loading,
  openShiftsCount,
  pendingSwapsCount,
  selectedShiftTime,
  showShiftTimeSelector,
  onViewChange,
  onDateRangeChange,
  onPrevious,
  onNext,
  onToday,
  onLocationChange,
  onSearchChange,
  onDepartmentChange,
  onPrint,
  onExport,
  onOpenAIScheduler,
  onOpenShifts,
  onShiftSwaps,
  onShiftTimeSelect,
  onToggleShiftTimeSelector,
  onOpenBulkCreator,
  onOpenBulkApproval,
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(dateRange[0].format("YYYY-MM-DD"));
  const [customEndDate, setCustomEndDate] = useState(dateRange[1].format("YYYY-MM-DD"));

  const getMaxEndDate = (startDate: string) => {
    if (!startDate) return "";
    const start = dayjs(startDate);
    return start.add(6, 'day').format("YYYY-MM-DD");
  };

  const getMinStartDate = (endDate: string) => {
    if (!endDate) return "";
    const end = dayjs(endDate);
    return end.subtract(6, 'day').format("YYYY-MM-DD");
  };

  const handleStartDateChange = (date: string) => {
    setCustomStartDate(date);
    const newEndDate = dayjs(date).add(6, 'day').format("YYYY-MM-DD");
    setCustomEndDate(newEndDate);
  };

  const handleEndDateChange = (date: string) => {
    setCustomEndDate(date);
    const newStartDate = dayjs(date).subtract(6, 'day').format("YYYY-MM-DD");
    setCustomStartDate(newStartDate);
  };

  const handleCustomDateApply = () => {
    const startDate = dayjs(customStartDate);
    const endDate = dayjs(customEndDate);
    
    if (startDate.isValid() && endDate.isValid()) {
      onDateRangeChange([startDate, endDate]);
      setShowCustomPicker(false);
    }
  };

  const handlePresetRange = (rangeType: "today" | "week" | "month") => {
    const today = dayjs();
    let startDate: Dayjs;
    let endDate: Dayjs;

    switch (rangeType) {
      case "today":
        startDate = today.startOf('day');
        endDate = today.endOf('day');
        break;
      case "week":
        startDate = today.startOf('week');
        endDate = today.endOf('week');
        break;
      case "month":
        startDate = today.startOf('month');
        endDate = today.endOf('month');
        break;
      default:
        startDate = today.startOf('week');
        endDate = today.endOf('week');
    }

    onDateRangeChange([startDate, endDate]);
    setCustomStartDate(startDate.format("YYYY-MM-DD"));
    setCustomEndDate(endDate.format("YYYY-MM-DD"));
    setShowCustomPicker(false);
  };

  const formatDateForDisplay = (date: Dayjs) => {
    return date.format("MMM D, YYYY");
  };

  const currentRangeDuration = dateRange[1].diff(dateRange[0], 'day') + 1;

  return (
    <div className="bg-white p-4 rounded-md shadow-sm mb-6 border border-gray-200">
      {/* Top Row - Header with Date Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {/* Location Filter */}
          <div className="flex items-center gap-2 flex-1 min-w-[300px]">
            <Select
              className="flex-1 rounded h-10"
              value={selectedLocation?.id}
              onChange={onLocationChange}
              loading={loading.clients}
              placeholder="Select location"
              disabled={loading.clients}
              suffixIcon={<FaStore className="text-teal-600 " />}
            >
              {clients.map((client) => (
                <Option
                  key={client.id}
                  value={client.id.toString()}
                  className=" text-lg font-bold text-teal-800"
                >
                  {client.business_name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <p className="text-sm text-teal-600 font-bold">
              {formatDateForDisplay(dateRange[0])} - {formatDateForDisplay(dateRange[1])}
            </p>
            <p className="text-xs text-gray-500">
              {currentRangeDuration} day{currentRangeDuration !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center ">
            <button
              onClick={onPrevious}
              className="p-2 rounded-tl rounded-bl border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Previous period"
            >
              <FaChevronLeft className="h-3 w-3 text-gray-600" />
            </button>

            <button
              onClick={onNext}
              className="p-2 rounded-tr rounded-br border border-gray-300 hover:bg-gray-100 transition-colors"
              aria-label="Next period"
            >
              <FaChevronRight className="h-3 w-3 text-gray-600" />
            </button>
            <button
              onClick={onToday}
              className="px-3 py-1 ml-2 text-sm rounded border border-gray-300  hover:bg-teal-50 hover:text-teal-600  transition-colors "
            >
              Today
            </button>
          </div>

          <Select
            value={view}
            onChange={onViewChange}
            className="w-32 rounded h-8 hover:bg-teal-50 hover:text-teal-600  transition-colors"
            suffixIcon={<FaCalendarAlt className="text-gray-400" />}
          >
            <Option value="day">Day View</Option>
            <Option value="week">Week View</Option>
            <Option value="month">Month View</Option>
          </Select>

          {/* Custom Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => setShowCustomPicker(!showCustomPicker)}
              className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded hover:border-teal-500 hover:bg-teal-50 transition-colors"
            >
              <FaCalendar className="text-teal-600" />
              <span className="text-sm">Select Week Range</span>
            </button>

            {showCustomPicker && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded shadow-lg p-4 z-50 min-w-[350px]">
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Select a 7-day period</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        max={getMaxEndDate(customStartDate)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        min={getMinStartDate(customEndDate)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Selected: {dayjs(customStartDate).format("MMM D")} - {dayjs(customEndDate).format("MMM D, YYYY")}
                    <br />({dayjs(customEndDate).diff(dayjs(customStartDate), 'day') + 1} days)
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handlePresetRange("today")}
                      className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-teal-100 transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handlePresetRange("week")}
                      className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-teal-100 transition-colors"
                    >
                      This Week
                    </button>
                  </div>

                  <div className="flex gap-2 justify-end border-t pt-2 mt-2">
                    <button
                      onClick={() => setShowCustomPicker(false)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCustomDateApply}
                      className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
            <Button
            icon={<FaPrint className="text-teal-600" />}
            className="flex items-center gap-2 text-gray-700 hover:text-teal-600 border border-gray-200 rounded hover:border-teal-300 bg-white h-10"
            onClick={onPrint}
            disabled={loading.shifts}
          >
            Print
          </Button>
          <Button
            icon={<FaFileExport className="text-teal-600" />}
            className="flex items-center gap-2 text-gray-700 hover:text-teal-600 border border-gray-200 rounded hover:border-teal-300 bg-white h-10"
            onClick={onExport}
            disabled={loading.shifts}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Bottom Row - Filters */}
      <div className="flex flex-wrap gap-4 items-center pt-4">
        {/* Search Filter */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FaSearch />
          </div>
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className=" pr-4 py-2 border border-gray-300 rounded w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-8"
            disabled={loading.employees}
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 flex-1 min-w-[170px]">
          <div className="text-gray-400">
            <FaFilter />
          </div>
          <Select
            value={departmentFilter}
            onChange={onDepartmentChange}
            className="flex-1 rounded h-10"
            disabled={loading.employees}
            placeholder="All Departments"
          >
            <Option value="All">All Departments</Option>
            {departments.map((dept) => (
              <Option key={dept} value={dept}>
                {dept}
              </Option>
            ))}
          </Select>
        </div>

        {/* Shift Time Selector */}
        <div className="relative flex items-center gap-2 flex-1 ">
          <div className="text-gray-400">
            <FaClockIcon />
          </div>
          <button
            onClick={onToggleShiftTimeSelector}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white rounded text-black border border-gray-300 hover:bg-gray-100 transition"
            title="Select shift duration"
          >
            <span>{`${selectedShiftTime.start}-${selectedShiftTime.end}`}</span>
          </button>

          {showShiftTimeSelector && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-[300px]">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Select Shift Duration</h4>
              <ShiftTimeSelector
                onSelect={onShiftTimeSelect}
                selectedTime={selectedShiftTime}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-auto">
          <Button
            icon={<FaRobot className="text-blue-500" />}
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 border border-gray-200 rounded hover:border-blue-300 bg-white h-10"
            onClick={onOpenAIScheduler}
          >
            AI Schedule
          </Button>
          <Button
            icon={<FaClock className="text-green-500" />}
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 border border-gray-200 rounded hover:border-green-300 bg-white h-10 relative"
            onClick={onOpenShifts}
          >
            Open Shifts
            {openShiftsCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 bg-green-100 text-green-800 absolute -top-2 -right-2"
              >
                {openShiftsCount}
              </Badge>
            )}
          </Button>
          <Button
            icon={<FaExchangeAlt className="text-purple-500" />}
            className="flex items-center gap-2 text-gray-700 hover:text-purple-600 border border-gray-200 rounded hover:border-purple-300 bg-white h-10 relative"
            onClick={onShiftSwaps}
          >
            Shift Swaps
            {pendingSwapsCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 bg-purple-100 text-purple-800 absolute -top-2 -right-2"
              >
                {pendingSwapsCount}
              </Badge>
            )}
          </Button>
           {/* Bulk Actions */}
              <Button
                icon={<FaCopy />}
                onClick={onOpenBulkCreator}
                className="border-0 text-gray-600 hover:bg-gray-50 rounded-r-none "
              >
                Save Template
              </Button>
              <Button
                icon={<FaCheckCircle />}
                onClick={onOpenBulkApproval}
                className="border-0 border-l border-gray-300 text-orange-600 hover:bg-orange-50 rounded-l-none relative"
              >
                Approve
                {bulkTemplatesCount > 0 && (
                  <Badge className="ml-1 bg-orange-100 text-orange-800">
                    {bulkTemplatesCount}
                  </Badge>
                )}
              </Button>
        
        </div>
      </div>
    </div>
  );
};