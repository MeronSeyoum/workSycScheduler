import React from "react";
import { Select, Button } from "antd";
import { 
  FaSearch, 
  FaFilter, 
  FaStore, 
  FaPrint, 
  FaFileExport, 
  FaRobot, 
  FaClock, 
  FaExchangeAlt 
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
    <div className="bg-white p-4 rounded-xl shadow-xs my-6 flex flex-wrap gap-4 items-center border border-gray-200">
      <div className="flex items-center gap-2 flex-1 min-w-[250px]">
        <div className="p-2 rounded-lg bg-teal-50">
          <FaStore className="text-teal-600" />
        </div>
        <Select
          className="flex-1 rounded-lg"
          value={selectedLocation?.id}
          onChange={onLocationChange}
          loading={loading.clients}
          placeholder="Select location"
          disabled={loading.clients}
        >
          {clients.map((client) => (
            <Option key={client.id} value={client.id.toString()}>
              {client.business_name}
            </Option>
          ))}
        </Select>
      </div>

      <div className="relative flex-1 min-w-[250px]">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 p-2 rounded-lg bg-gray-50">
          <FaSearch />
        </div>
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm h-10 bg-gray-50"
          disabled={loading.employees}
        />
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <div className="p-2 rounded-lg bg-teal-50">
          <FaFilter className="text-teal-600" />
        </div>
        <Select
          value={departmentFilter}
          onChange={onDepartmentChange}
          className="flex-1 rounded-lg"
          disabled={loading.employees}
        >
          <Option value="All">All Departments</Option>
          {departments.map((dept) => (
            <Option key={dept} value={dept}>
              {dept}
            </Option>
          ))}
        </Select>
      </div>

      <div className="flex gap-2 ml-auto">
        <Button
          icon={<FaPrint className="text-teal-600" />}
          className="flex items-center gap-2 text-gray-700 hover:text-teal-600 border border-gray-200 rounded-lg hover:border-teal-300 bg-white"
          onClick={onPrint}
          disabled={loading.shifts}
        >
          Print
        </Button>
        <Button
          icon={<FaFileExport className="text-teal-600" />}
          className="flex items-center gap-2 text-gray-700 hover:text-teal-600 border border-gray-200 rounded-lg hover:border-teal-300 bg-white"
          onClick={onExport}
          disabled={loading.shifts}
        >
          Export
        </Button>
        <Button
          icon={<FaRobot className="text-blue-500" />}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 border border-gray-200 rounded-lg hover:border-blue-300 bg-white"
          onClick={onOpenAIScheduler}
        >
          AI Schedule
        </Button>
        <Button
          icon={<FaClock className="text-green-500" />}
          className="flex items-center gap-2 text-gray-700 hover:text-green-600 border border-gray-200 rounded-lg hover:border-green-300 bg-white"
          onClick={onOpenShifts}
        >
          Open Shifts
          {openShiftsCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
              {openShiftsCount}
            </Badge>
          )}
        </Button>
        <Button
          icon={<FaExchangeAlt className="text-purple-500" />}
          className="flex items-center gap-2 text-gray-700 hover:text-purple-600 border border-gray-200 rounded-lg hover:border-purple-300 bg-white"
          onClick={onShiftSwaps}
        >
          Shift Swaps
          {pendingSwapsCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-800">
              {pendingSwapsCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};