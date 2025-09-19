// ScheduleHeader.tsx
import React from "react";
import { Button, Select, Input, Card, DatePicker, Space } from "antd";
import {
  PlusCircle,
  TagIcon,
  UndoIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MdPublish } from "react-icons/md";
import { Dayjs } from "dayjs";

const { Option } = Select;

// Constants
const TEAL_700 = "oklch(51.1% 0.096 186.391)";
const TEAL_800 = "oklch(43.7% 0.078 188.216)";
const BORDER_DEFAULT = "oklch(0% 0 0 / 0.15)";
const TRANSITION = "all 0.2s ease-in-out";
const HOVER_BG = "oklch(51.1% 0.096 186.391 / 0.1)";

// Interfaces
interface ScheduleHeaderProps {
  dateRange: [Dayjs, Dayjs];
  clients: any[];
  selectedLocation: any;
  departmentFilter: string;
  searchTerm: string;
  view: string;
  loading: any;
  stats: any;
  onLocationChange: (locationId: string) => void;
  onDepartmentChange: (department: string) => void;
  onSearchChange: (searchTerm: string) => void;
   onViewChange: (view: "day" | "week" | "month") => void;
  onDateRangeChange: (range: [Dayjs, Dayjs]) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onCreateNewShift: (date?: string, isUnassigned?: boolean) => void;
  onPublishSchedule: () => void;
  onUndoChanges: () => void;
}

// Reusable View Button Component
const ViewButton: React.FC<{
  view: string;
  currentView: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ view, currentView, onClick, children }) => {
  const isActive = view === currentView;

  return (
    <Button
      onClick={onClick}
      style={{
        backgroundColor: isActive ? TEAL_700 : "transparent",
        color: isActive ? "white" : TEAL_700,
        borderColor: isActive ? TEAL_700 : BORDER_DEFAULT,
        borderWidth: "1px",
        fontWeight: isActive ? "600" : "400",
        transition: TRANSITION,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = HOVER_BG;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {children}
    </Button>
  );
};

// Reusable Form Element Wrapper
// Reusable Form Element Wrapper - Wrapper div approach
const StyledFormElement: React.FC<{
  children: React.ReactElement<any>;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-block',
    border: `1px solid ${isHovered ? TEAL_700 : BORDER_DEFAULT}`,
    borderRadius: '6px',
    transition: "border-color 0.2s ease-in-out",
    ...style,
  };

  return (
    <div
      style={wrapperStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {React.cloneElement(children, {
        style: {
          ...children.props.style,
          border: 'none',
          boxShadow: 'none',
        },
      })}
    </div>
  );
};

// Stats Card Component
const StatCard: React.FC<{
  value: number | string;
  label: string;
  bgColor: string;
  textColor: string;
}> = ({ value, label, bgColor, textColor }) => (
  <Card
    size="small"
    className="text-center border-0 shadow-xs"
    style={{ backgroundColor: bgColor }}
  >
    <div className="text-2xl font-bold" style={{ color: textColor }}>
      {value}
    </div>
    <div className="text-xs" style={{ color: textColor }}>
      {label}
    </div>
  </Card>
);

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  dateRange,
  clients,
  selectedLocation,
  departmentFilter,
  searchTerm,
  view,
  loading,
  stats,
  onLocationChange,
  onDepartmentChange,
  onSearchChange,
  onViewChange,
  onDateRangeChange,
  onPrevious,
  onNext,
  onToday,
  onCreateNewShift,
  onPublishSchedule,
  onUndoChanges,
}) => {
  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      const startOfWeek = date.startOf("isoWeek");
      const endOfWeek = date.endOf("isoWeek");
      onDateRangeChange([startOfWeek, endOfWeek]);
    }
  };

  const getWeekDisplayText = () => {
    const start = dateRange[0];
    const end = dateRange[1];
    return start.month() === end.month()
      ? `${start.format("MMM D")} - ${end.format("D, YYYY")}`
      : `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
  };

  const departmentOptions = React.useMemo(
    () => Array.from(new Set(clients.map((e) => e.position).filter(Boolean))),
    [clients]
  );

  return (
    <div className="bg-white rounded-md shadow-sm p-6 mb-6 border border-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-base font-semibold text-teal-600">
            {getWeekDisplayText()}
          </p>
          
          
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => onCreateNewShift()}
            icon={<PlusCircle size={16} />}
            style={{
              backgroundColor: TEAL_700,
              color: "white",
              borderColor: TEAL_800,
            }}
          >
            New Shift
          </Button>

          <Button
            onClick={() => onCreateNewShift(undefined, true)}
            icon={<TagIcon size={16} />}
            style={{
              borderColor: TEAL_700,
              color: TEAL_700,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = HOVER_BG;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Unassigned
          </Button>

          <Button
            onClick={onPublishSchedule}
            loading={loading.publishing}
            icon={<MdPublish size={16} />}
            style={{
              borderColor: "oklch(64.8% 0.15 149.214)",
              color: "oklch(64.8% 0.15 149.214)",
              backgroundColor: "transparent",
            }}
          >
            Publish
          </Button>

          <Button
            icon={<UndoIcon size={16} />}
            onClick={onUndoChanges}
            loading={loading.publishing}
            style={{
              borderColor: "oklch(76.9% 0.168 70.08)",
              color: "oklch(76.9% 0.168 70.08)",
              backgroundColor: "transparent",
            }}
          >
            Undo
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <StatCard
          value={stats.totalShifts}
          label="Total"
          bgColor="oklch(51.1% 0.096 186.391 / 0.1)"
          textColor={TEAL_700}
        />
        <StatCard
          value={stats.unassignedShifts}
          label="Unassigned"
          bgColor="oklch(76.3% 0.184 292.717 / 0.1)"
          textColor="oklch(76.3% 0.184 292.717)"
        />
        <StatCard
          value={stats.draftShifts}
          label="Drafts"
          bgColor="oklch(76.9% 0.168 70.08 / 0.1)"
          textColor="oklch(76.9% 0.168 70.08)"
        />
        <StatCard
          value={`${stats.avgHours}h`}
          label="Avg Hours"
          bgColor="oklch(64.8% 0.15 149.214 / 0.1)"
          textColor="oklch(64.8% 0.15 149.214)"
        />
        <StatCard
          value={stats.nightShifts}
          label="Night"
          bgColor="oklch(63.7% 0.237 25.331 / 0.1)"
          textColor="oklch(63.7% 0.237 25.331)"
        />
        <StatCard
          value={`${stats.balanceScore}%`}
          label="Balance"
          bgColor="oklch(58.1% 0.241 292.717 / 0.1)"
          textColor="oklch(58.1% 0.241 292.717)"
        />
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
        {/* Location */}
        <StyledFormElement style={{ minWidth: "200px" }}>
          <Select
            value={selectedLocation?.id}
            onChange={onLocationChange}
            placeholder="Select location"
          >
            {clients.map((client) => (
              <Option key={client.id} value={client.id.toString()}>
                {client.business_name}
              </Option>
            ))}
          </Select>
        </StyledFormElement>
        {/* Search */}
        <StyledFormElement style={{ minWidth: "200px" }}>
          <Input.Search
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </StyledFormElement>
        {/* Department */}
        <StyledFormElement style={{ minWidth: "200px" }}>
          <Select
            value={departmentFilter}
            onChange={onDepartmentChange}
            placeholder="Department"
          >
            <Option value="All">All Departments</Option>
            {departmentOptions.map((pos) => (
              <Option key={pos} value={pos}>
                {pos}
              </Option>
            ))}
          </Select>
        </StyledFormElement>

        {/* View Controls */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center gap-2">
            <Space.Compact>
              <ViewButton
                view="day"
                currentView={view}
                onClick={() => onViewChange("day")}
              >
                Day
              </ViewButton>
              <ViewButton
                view="week"
                currentView={view}
                onClick={() => onViewChange("week")}
              >
                Week
              </ViewButton>
              <ViewButton
                view="month"
                currentView={view}
                onClick={() => onViewChange("month")}
              >
                Month
              </ViewButton>
            </Space.Compact>

            <Space.Compact>
              <Button onClick={onPrevious} icon={<ChevronLeft size={14} />} />
              <Button onClick={onToday}>Today</Button>
              <Button onClick={onNext} icon={<ChevronRight size={14} />} />
            </Space.Compact>
            {/* Week Selector */}
          <StyledFormElement style={{ minWidth: "190px" }}>
            <DatePicker
              onChange={handleDateChange}
              value={dateRange[0]}
              format="MMM D, YYYY"
              allowClear={false}
              placeholder="Select week"
              style={{ width: "100%" }}
              renderExtraFooter={() => (
                <div style={{ padding: '10px', textAlign: 'center' }}>
                  <Button 
                    type="primary" 
                    size="small"
                    onClick={() => handleDateChange(dateRange[0])}
                  >
                    Select Full Week (Mon-Sun)
                  </Button>
                </div>
              )}
            />
          </StyledFormElement>
          </div>
        </div>
      </div>
    </div>
  );
};