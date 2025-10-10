// ScheduleHeader.tsx - Optimized with Template Dropdown
import React from "react";
import { Button, Select, Input, Card, DatePicker, Space, Dropdown } from "antd";
import {
  PlusCircle,
  Tag as TagIcon,
  Undo2 as UndoIcon,
  ChevronLeft,
  ChevronRight,
  Copy, 
  Clipboard as Paste, 
  BookmarkPlus, 
  FolderOpen,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  List as ListIcon,
  Eye as EyeIcon,
  Download as DownloadIcon,
  Printer as PrinterIcon
} from "lucide-react";
import { MdPublish } from "react-icons/md";
import { Dayjs, } from "dayjs";
import dayjs from "dayjs";
import { ScheduleTemplate, WeekScheduleData } from "@/lib/types/schedule";

const { Option } = Select;

// Standardized Color Constants
const COLORS = {
  PRIMARY: "oklch(51.1% 0.096 186.391)",
  PRIMARY_DARK: "oklch(43.7% 0.078 188.216)",
  BORDER_DEFAULT: "oklch(0% 0 0 / 0.15)",
  BORDER_LIGHT: "#e5e7eb",
  TEXT_DISABLED: "#9ca3af",
  TEXT_SECONDARY: "#6b7280",
  SUCCESS: "#059669",
  PURPLE: "#7c3aed",
  BLUE: "#0891b2"
} as const;

const TRANSITION = "all 0.2s ease-in-out";
const HOVER_BG = "oklch(51.1% 0.096 186.391 / 0.1)";

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
  
  // Template and utility functions
  copiedWeekSchedule?: WeekScheduleData | null;
  scheduleTemplates?: ScheduleTemplate[];
  onCopyWeek?: () => void;
  onPasteWeek?: () => void;
  onShowCopyPasteModal?: () => void;
  onShowTemplateModal?: () => void;
  onApplyTemplate?: (templateId: string) => void;
  onViewShiftTemplates?: () => void;
  onSaveScheduleToTemplate?: () => void;
  onLoadScheduleFromTemplate?: () => void;
  onPrintCurrentSchedule?: () => void;
  hasCurrentWeekData?: boolean;
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
        backgroundColor: isActive ? COLORS.PRIMARY : "transparent",
        color: isActive ? "white" : COLORS.PRIMARY,
        borderColor: isActive ? COLORS.PRIMARY : COLORS.BORDER_DEFAULT,
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
const StyledFormElement: React.FC<{
  children: React.ReactElement<any>;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const wrapperStyle: React.CSSProperties = {
    display: 'inline-block',
    border: `1px solid ${isHovered ? COLORS.PRIMARY : COLORS.BORDER_DEFAULT}`,
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

// Template Dropdown Option Component
const TemplateDropdownOption: React.FC<{ template: ScheduleTemplate }> = ({ template }) => (
  <div className="flex justify-between items-center min-w-[280px] py-2">
    <div className="flex-1">
      <div className="font-medium text-sm text-gray-800">{template.name}</div>
      <div className="text-xs text-gray-500 mt-1">
        <span className="inline-flex items-center gap-1">
          <BriefcaseIcon size={12} />
          {template.weekSchedule.metadata.totalShifts} shifts
        </span>
        {' • '}
        <span className="inline-flex items-center gap-1">
          <UsersIcon size={12} />
          {template.weekSchedule.metadata.employeeCount} employees
        </span>
        {' • '}
        <span className="inline-flex items-center gap-1">
          <ClockIcon size={12} />
          {template.weekSchedule.metadata.totalHours}h
        </span>
      </div>
      {template.description && (
        <div className="text-xs text-gray-400 mt-1 truncate max-w-[220px]">
          {template.description}
        </div>
      )}
    </div>
    <div className="ml-3 text-xs text-gray-400">
      {dayjs(template.createdAt).format('MMM D')}
    </div>
  </div>
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
  // Template and utility props
  copiedWeekSchedule,
  scheduleTemplates = [],
  onCopyWeek,
  onPasteWeek,
  onShowCopyPasteModal,
  onShowTemplateModal,
  onApplyTemplate,
  onViewShiftTemplates,
  onSaveScheduleToTemplate,
  onLoadScheduleFromTemplate,
  onPrintCurrentSchedule,
  hasCurrentWeekData = false,
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

  // Template dropdown menu items
  const templateMenuItems = [
    {
      key: 'save-template',
      label: (
        <div className="flex items-center gap-3 py-2">
          <BookmarkPlus size={16} style={{ color: COLORS.PRIMARY }} />
          <div>
            <div className="font-medium text-sm">Save Schedule to Template</div>
            <div className="text-xs text-gray-500">Save current week as reusable template</div>
          </div>
        </div>
      ),
      onClick: onSaveScheduleToTemplate || onShowTemplateModal,
      disabled: !hasCurrentWeekData
    },
    {
      key: 'load-template',
      label: (
        <div className="flex items-center gap-3 py-2">
          <FolderOpen size={16} style={{ color: COLORS.PRIMARY }} />
          <div>
            <div className="font-medium text-sm">Load Schedule from Template</div>
            <div className="text-xs text-gray-500">Apply a saved template to current week</div>
          </div>
        </div>
      ),
      onClick: onLoadScheduleFromTemplate || onShowTemplateModal
    },
    {
      key: 'view-templates',
      label: (
        <div className="flex items-center gap-3 py-2">
          <EyeIcon size={16} style={{ color: COLORS.PRIMARY }} />
          <div>
            <div className="font-medium text-sm">View Shift Templates</div>
            <div className="text-xs text-gray-500">Browse and manage all templates</div>
          </div>
        </div>
      ),
      onClick: onViewShiftTemplates
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'apply-template-header',
      label: <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-1">Quick Apply Templates</div>,
      disabled: true
    },
    ...(scheduleTemplates && scheduleTemplates.length > 0 ? 
      scheduleTemplates.slice(0, 5).map((template) => ({
        key: `template-${template.id}`,
        label: <TemplateDropdownOption template={template} />,
        onClick: () => onApplyTemplate?.(template.id)
      })) : [{
        key: 'no-templates',
        label: (
          <div className="text-center py-3 text-gray-400">
            <FolderOpen size={24} className="mx-auto mb-2" />
            <div className="text-sm">No templates available</div>
          </div>
        ),
        disabled: true
      }]
    ),
    ...(scheduleTemplates && scheduleTemplates.length > 5 ? [{
      key: 'view-all-templates',
      label: (
        <div className="text-center py-2 text-blue-600 hover:text-blue-800">
          View all {scheduleTemplates.length} templates →
        </div>
      ),
      onClick: onViewShiftTemplates
    }] : [])
  ];

  // Utility dropdown menu items
  const utilityMenuItems = [
    {
      key: 'print-schedule',
      label: (
        <div className="flex items-center gap-3 py-2">
          <PrinterIcon size={16} style={{ color: COLORS.PRIMARY }} />
          <div>
            <div className="font-medium text-sm">Print Current Schedule</div>
            <div className="text-xs text-gray-500">Generate PDF of current week</div>
          </div>
        </div>
      ),
      onClick: onPrintCurrentSchedule,
      disabled: !hasCurrentWeekData
    },
    {
      key: 'export-csv',
      label: (
        <div className="flex items-center gap-3 py-2">
          <DownloadIcon size={16} style={{ color: COLORS.PRIMARY }} />
          <div>
            <div className="font-medium text-sm">Export to CSV</div>
            <div className="text-xs text-gray-500">Download schedule data</div>
          </div>
        </div>
      ),
      onClick: () => console.log('Export CSV'),
      disabled: !hasCurrentWeekData
    },
    {
      key: 'view-reports',
      label: (
        <div className="flex items-center gap-3 py-2">
          <ListIcon size={16} style={{ color: COLORS.PRIMARY }} />
          <div>
            <div className="font-medium text-sm">View Schedule Reports</div>
            <div className="text-xs text-gray-500">Analytics and insights</div>
          </div>
        </div>
      ),
      onClick: () => console.log('View Reports')
    }
  ];

  return (
    <div className="bg-white rounded-md shadow-sm p-6 mb-6 border border-gray-100">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-base font-semibold" style={{ color: COLORS.PRIMARY }}>
            {getWeekDisplayText()}
          </p>
        </div>

        {/* Action Buttons - Enhanced with Templates Dropdown */}
        <div className="flex flex-wrap gap-2">
          {/* Basic Actions */}
          <Button
            onClick={() => onCreateNewShift()}
            icon={<PlusCircle size={16} />}
            style={{ 
              backgroundColor: COLORS.PRIMARY, 
              color: "white", 
              borderColor: COLORS.PRIMARY_DARK 
            }}
          >
            New Shift
          </Button>

          <Button
            onClick={() => onCreateNewShift(undefined, true)}
            icon={<TagIcon size={16} />}
            style={{ 
              borderColor: COLORS.PRIMARY, 
              color: COLORS.PRIMARY, 
              backgroundColor: "transparent" 
            }}
          >
            Unassigned
          </Button>

          {/* Copy/Paste Actions */}
          <div className="flex gap-1 border border-gray-200 rounded-md overflow-hidden">
            <Button
              onClick={onShowCopyPasteModal}
              icon={<Copy size={16} />}
              type="text"
              disabled={!hasCurrentWeekData}
              className="border-0 hover:bg-blue-50 rounded-none"
              title={hasCurrentWeekData ? "Copy current week" : "No shifts to copy"}
              style={{ 
                color: hasCurrentWeekData ? COLORS.BLUE : COLORS.TEXT_DISABLED,
                borderRadius: '6px 0 0 6px',
                minWidth: '80px'
              }}
            >
              Copy
            </Button>
            
            <div className="w-px bg-gray-200 my-1"></div>
            
            <Button
              onClick={onPasteWeek || onShowCopyPasteModal}
              icon={<Paste size={16} />}
              type="text"
              disabled={!copiedWeekSchedule}
              className="border-0 hover:bg-green-50 rounded-none"
              title={copiedWeekSchedule 
                ? `Paste ${copiedWeekSchedule.metadata?.totalShifts || 0} shifts from ${copiedWeekSchedule.metadata?.locationName}` 
                : "No copied week data"
              }
              style={{ 
                color: copiedWeekSchedule ? COLORS.SUCCESS : COLORS.TEXT_DISABLED,
                borderRadius: '0 6px 6px 0',
                minWidth: '80px'
              }}
            >
              Paste
            </Button>
          </div>

          {/* Templates Dropdown */}
          <Dropdown
            menu={{ items: templateMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="template-dropdown-overlay"
          >
            <Button
              icon={<ListIcon size={16} />}
              style={{ 
                borderColor: COLORS.PRIMARY,
                color: COLORS.PRIMARY,
                backgroundColor: 'transparent'
              }}
            >
              Templates
              {scheduleTemplates && scheduleTemplates.length > 0 && (
                <span className="ml-1 text-xs bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-full">
                  {scheduleTemplates.length}
                </span>
              )}
            </Button>
          </Dropdown>

          {/* Utilities Dropdown */}
          <Dropdown
            menu={{ items: utilityMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              icon={<DownloadIcon size={16} />}
              style={{ 
                borderColor: COLORS.BORDER_LIGHT,
                color: COLORS.TEXT_SECONDARY,
                backgroundColor: 'transparent'
              }}
            >
              Utilities
            </Button>
          </Dropdown>

          {/* Publishing Actions */}
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
          textColor={COLORS.PRIMARY}
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
        <StyledFormElement>
          <Select
            value={selectedLocation?.id}
            onChange={onLocationChange}
            placeholder="Select location"
            style={{ width: '100%' }}
          >
            {clients.map((client) => (
              <Option key={client.id} value={client.id.toString()}>
                { client.business_name}
              </Option>
            ))}
          </Select>
        </StyledFormElement>
       
        {/* Search */}
        <StyledFormElement>
          <Input.Search
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            style={{ width: '100%' }}
          />
        </StyledFormElement>
       
        {/* Department */}
        <StyledFormElement>
          <Select
            value={departmentFilter}
            onChange={onDepartmentChange}
            placeholder="Department"
            style={{ width: '100%' }}
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
        <StyledFormElement style={{ minWidth: "195px"}}>
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
                  style={{
                    backgroundColor: COLORS.PRIMARY,
                    borderColor: COLORS.PRIMARY
                  }}
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