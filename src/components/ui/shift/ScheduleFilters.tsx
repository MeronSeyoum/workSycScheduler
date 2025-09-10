// ScheduleFilters.tsx - Redesigned
import React from "react";
import { Select, Button, Input } from "antd";
import { 
  FaSearch, 
  FaFilter, 
  FaPrint, 
  FaFileExport, 
  FaRobot, 
  FaClock, 
  FaExchangeAlt, 
  FaStore
} from "react-icons/fa";
import { Badge } from "@/components/ui/common/badge";
import { Client } from "@/lib/types/client";

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

interface ScheduleFiltersProps {
  clients: Client[];
  selectedLocation: LocationData | null;
  searchTerm: string;
  departmentFilter: string;
  loading: LoadingState;
  openShiftsCount: number;
  pendingSwapsCount: number;
  onLocationChange: (locationId: string) => void;
  onSearchChange: (searchTerm: string) => void;
  onDepartmentChange: (department: string) => void;
  onPrint: () => void;
  onExport: () => void;
  onOpenAIScheduler: () => void;
  onOpenShifts: () => void;
  onShiftSwaps: () => void;
}

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  clients,
  selectedLocation,
  searchTerm,
  departmentFilter,
  loading,
  openShiftsCount,
  pendingSwapsCount,
  onLocationChange,
  onSearchChange,
  onDepartmentChange,
  onPrint,
  onExport,
  onOpenAIScheduler,
  onOpenShifts,
  onShiftSwaps,
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center border border-gray-200">
      {/* Location Filter */}
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Select
          className="flex-1 rounded-lg h-10"
          value={selectedLocation?.id}
          onChange={onLocationChange}
          loading={loading.clients}
          placeholder="Select location"
          disabled={loading.clients}
          suffixIcon={<FaStore className="text-teal-600" />}
        >
          {clients.map((client) => (
            <Option key={client.id} value={client.id.toString()}>
              {client.business_name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Search Filter */}
      <div className="relative flex-1 min-w-[250px]">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FaSearch />
        </div>
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-10"
          disabled={loading.employees}
        />
      </div>

      {/* Department Filter */}
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <div className="text-gray-400">
          <FaFilter />
        </div>
        <Select
          value={departmentFilter}
          onChange={onDepartmentChange}
          className="flex-1 rounded-lg h-10"
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

      {/* Action Buttons */}
      <div className="flex gap-2 ml-auto">
        <Button
          icon={<FaPrint className="text-teal-600" />}
          className="flex items-center gap-2 text-gray-700 hover:text-teal-600 border border-gray-200 rounded-lg hover:border-teal-300 bg-white h-10"
          onClick={onPrint}
          disabled={loading.shifts}
        >
          Print
        </Button>
        <Button
          icon={<FaFileExport className="text-teal-600" />}
          className="flex items-center gap-2 text-gray-700 hover:text-teal-600 border border-gray-200 rounded-lg hover:border-teal-300 bg-white h-10"
          onClick={onExport}
          disabled={loading.shifts}
        >
          Export
        </Button>
        <Button
          icon={<FaRobot className="text-blue-500" />}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 border border-gray-200 rounded-lg hover:border-blue-300 bg-white h-10"
          onClick={onOpenAIScheduler}
        >
          AI Schedule
        </Button>
        <Button
          icon={<FaClock className="text-green-500" />}
          className="flex items-center gap-2 text-gray-700 hover:text-green-600 border border-gray-200 rounded-lg hover:border-green-300 bg-white h-10 relative"
          onClick={onOpenShifts}
        >
          Open Shifts
          {openShiftsCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800 absolute -top-2 -right-2">
              {openShiftsCount}
            </Badge>
          )}
        </Button>
        <Button
          icon={<FaExchangeAlt className="text-purple-500" />}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-600 border border-gray-200 rounded-lg hover:border-purple-300 bg-white h-10 relative"
          onClick={onShiftSwaps}
        >
          Shift Swaps
          {pendingSwapsCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-800 absolute -top-2 -right-2">
              {pendingSwapsCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};