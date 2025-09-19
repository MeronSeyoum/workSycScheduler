import { useState, useMemo, useCallback } from "react";
import { Table } from "@/components/ui/common/Table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/attendance/AttendanceCard";
import Input from "@/components/ui/common/Input";
import Button from "@/components/ui/common/Button";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Users,
  X,
  RefreshCw,
  MapPin,
  UserCheck,
  Calendar,
} from "lucide-react";
import {
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import { AttendanceRecord } from "@/lib/types/attendance";

// Drawer Component
interface DrawerProps {
  title: string;
  width: number;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  styles?: {
    body?: React.CSSProperties;
  };
}

const Drawer: React.FC<DrawerProps> = ({
  title,
  width,
  open,
  onClose,
  children,
  styles = {},
}) => {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-50 z-50 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ width: `${width}px` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Body */}
        <div 
          className="h-full overflow-y-auto"
          style={styles.body}
        >
          {children}
        </div>
      </div>
    </>
  );
};

interface DateRange {
  start: string;
  end: string;
}

interface FilterState {
  employees: string[];
  dateRange: DateRange;
  status: string[];
  departments: string[];
}

interface AttendanceSheetProps {
  data?: AttendanceRecord[];
  showAllColumns?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

// Helper function to get status display label
const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    present: "Present",
    late_arrival: "Late Arrival", 
    absent: "Absent",
    early_departure: "Early Departure",
  };
  return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
};

// Helper function to get status indicator color
const getStatusIndicatorColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    present: "bg-green-500",
    late_arrival: "bg-yellow-500",
    absent: "bg-red-500",
    early_departure: "bg-orange-500",
  };
  return statusColors[status] || "bg-gray-500";
};

const AttendanceSheet = ({
  data = [],
  showAllColumns = false,
  onRefresh,
  isLoading = false,
}: AttendanceSheetProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AttendanceRecord;
    direction: "ascending" | "descending";
  }>({
    key: "date",
    direction: "descending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    employees: [],
    dateRange: {
      start: format(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd"
      ),
      end: format(new Date(), "yyyy-MM-dd"),
    },
    status: [],
    departments: [],
  });

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const employees = [
      ...new Set(
        safeData.map((record) => ({
          code: record.employeeCode || String(record.employeeId),
          name: record.employeeName || "Unknown",
        }))
      ),
    ];
    const statuses = [
      ...new Set(safeData.map((record) => record.status)),
    ].filter(Boolean) as string[];
    const departments = [
      ...new Set(safeData.map((record) => record.position || "Unassigned")),
    ];
    return { statuses, departments, employees };
  }, [safeData]);

  const requestSort = useCallback(
    (key: keyof AttendanceRecord) => {
      let direction: "ascending" | "descending" = "ascending";
      if (sortConfig?.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
      setCurrentPage(1);
    },
    [sortConfig]
  );

  // Enhanced filtering and sorting logic
  const processedData = useMemo(() => {
    let filtered = [...safeData];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.employeeName?.toLowerCase().includes(searchLower) ||
          String(record.employeeId)?.toLowerCase().includes(searchLower) ||
          record.employeeCode?.toLowerCase().includes(searchLower) ||
          record.position?.toLowerCase().includes(searchLower)
      );
    }

    // Apply employee filter
    if (filters.employees.length > 0) {
      filtered = filtered.filter((record) =>
        filters.employees.includes(
          record.employeeCode || String(record.employeeId)
        )
      );
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      const startDate = startOfDay(parseISO(filters.dateRange.start));
      const endDate = endOfDay(parseISO(filters.dateRange.end));

      filtered = filtered.filter((record) => {
        try {
          const recordDate = parseISO(record.date);
          return isWithinInterval(recordDate, {
            start: startDate,
            end: endDate,
          });
        } catch {
          return false;
        }
      });
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((record) =>
        filters.status.includes(record.status)
      );
    }

    // Apply department filter
    if (filters.departments.length > 0) {
      filtered = filtered.filter((record) =>
        filters.departments.includes(record.position || "Unassigned")
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        // Special handling for time fields
        if (sortConfig.key === "clockIn" || sortConfig.key === "clockOut") {
          const timeToMinutes = (time: string | null) => {
            if (!time) return 0;
            try {
              const date = parseISO(time);
              return date.getHours() * 60 + date.getMinutes();
            } catch {
              return 0;
            }
          };
          const aTime = timeToMinutes(a[sortConfig.key] as string | null);
          const bTime = timeToMinutes(b[sortConfig.key] as string | null);
          return sortConfig.direction === "ascending"
            ? aTime - bTime
            : bTime - aTime;
        }

        // Special handling for date fields
        if (sortConfig.key === "date") {
          try {
            const aDate = parseISO(a[sortConfig.key] as string);
            const bDate = parseISO(b[sortConfig.key] as string);
            return sortConfig.direction === "ascending"
              ? aDate.getTime() - bDate.getTime()
              : bDate.getTime() - aDate.getTime();
          } catch {
            return 0;
          }
        }

        // General comparison
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle undefined/null values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (bValue == null)
          return sortConfig.direction === "ascending" ? 1 : -1;

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [safeData, searchTerm, filters, sortConfig]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const getSortIcon = (key: keyof AttendanceRecord) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 inline" />
    );
  };

  // Safe date formatting with better handling for different date formats
  const safeFormat = (
    dateString: string | null | undefined,
    formatString: string
  ) => {
    if (!dateString) return "-";
    try {
      // Handle both ISO strings and regular date strings
      const date =
        typeof dateString === "string"
          ? parseISO(dateString)
          : new Date(dateString);
      return format(date, formatString);
    } catch {
      return "Invalid date";
    }
  };

  // Calculate actual hours worked between clock in and out
  const calculateHours = (clockIn: string | null, clockOut: string | null) => {
    if (!clockIn || !clockOut) return null;
    try {
      const inTime = parseISO(clockIn);
      const outTime = parseISO(clockOut);
      const diffMs = outTime.getTime() - inTime.getTime();
      return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
    } catch {
      return null;
    }
  };

  // Filter management functions
  const clearFilters = () => {
    setFilters({
      employees: [],
      dateRange: {
        start: format(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd"
        ),
        end: format(new Date(), "yyyy-MM-dd"),
      },
      status: [],
      departments: [],
    });
    setCurrentPage(1);
  };

  const toggleEmployeeFilter = (employeeCode: string) => {
    setFilters((prev) => ({
      ...prev,
      employees: prev.employees.includes(employeeCode)
        ? prev.employees.filter((code) => code !== employeeCode)
        : [...prev.employees, employeeCode],
    }));
  };

  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const toggleDepartmentFilter = (department: string) => {
    setFilters((prev) => ({
      ...prev,
      departments: prev.departments.includes(department)
        ? prev.departments.filter((d) => d !== department)
        : [...prev.departments, department],
    }));
  };

  const removeEmployeeFilter = (employeeCode: string) => {
    setFilters((prev) => ({
      ...prev,
      employees: prev.employees.filter((code) => code !== employeeCode),
    }));
  };

  const removeStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.filter((s) => s !== status),
    }));
  };

  const removeDepartmentFilter = (department: string) => {
    setFilters((prev) => ({
      ...prev,
      departments: prev.departments.filter((d) => d !== department),
    }));
  };

  const exportData = () => {
    // Create CSV content
    const headers = [
      "Employee Name",
      "Employee Code",
      "Date",
      "Clock In",
      "Clock Out",
      "Hours Worked",
      "Status",
      ...(showAllColumns ? ["Location", "Method", "Position"] : []),
    ];

    const csvContent = [
      headers.join(","),
      ...processedData.map((record) =>
        [
          `"${record.employeeName || ""}"`,
          record.employeeCode || "",
          safeFormat(record.date, "yyyy-MM-dd"),
          safeFormat(record.clockIn, "HH:mm"),
          safeFormat(record.clockOut, "HH:mm"),
          record.hoursWorked?.toFixed(1) || "",
          record.status || "",
          ...(showAllColumns
            ? [
                record.location || "",
                record.method || "",
                record.position || "",
              ]
            : []),
        ].join(",")
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const activeFiltersCount =
    filters.employees.length +
    filters.status.length +
    filters.departments.length +
    (filters.dateRange.start !==
      format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd") ||
    filters.dateRange.end !== format(new Date(), "yyyy-MM-dd")
      ? 1
      : 0);

  return (
    <div className="space-y-4">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Attendance Records</CardTitle>
              <p className="text-sm text-gray-500">
                {processedData.length} records found
                {filters.dateRange.start === filters.dateRange.end
                  ? ` for ${safeFormat(filters.dateRange.start, "MMM d, yyyy")}`
                  : ` from ${safeFormat(
                      filters.dateRange.start,
                      "MMM d"
                    )} to ${safeFormat(filters.dateRange.end, "MMM d, yyyy")}`}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search employees..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant={drawerVisible ? "primary" : "secondary"}
                size="sm"
                onClick={() => setDrawerVisible(true)}
                className="relative"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              {onRefresh && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={exportData}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Active Filters Display - Always visible when filters are applied */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.employees.map((empCode) => {
                const employee = filterOptions.employees.find(
                  (e) => e.code === empCode
                );
                return (
                  <span
                    key={empCode}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    <Users className="h-3 w-3" />
                    {employee?.name || empCode}
                    <X
                      className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded-full"
                      onClick={() => removeEmployeeFilter(empCode)}
                    />
                  </span>
                );
              })}
              {filters.status.map((status) => (
                <span
                  key={status}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <UserCheck className="h-3 w-3" />
                  {getStatusLabel(status)}
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-green-200 rounded-full"
                    onClick={() => removeStatusFilter(status)}
                  />
                </span>
              ))}
              {filters.departments.map((dept) => (
                <span
                  key={dept}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <MapPin className="h-3 w-3" />
                  {dept}
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-purple-200 rounded-full"
                    onClick={() => removeDepartmentFilter(dept)}
                  />
                </span>
              ))}
              {filters.dateRange.start !==
                format(
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  "yyyy-MM-dd"
                ) ||
              filters.dateRange.end !== format(new Date(), "yyyy-MM-dd") ? (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {safeFormat(filters.dateRange.start, "MMM d")} -{" "}
                  {safeFormat(filters.dateRange.end, "MMM d, yyyy")}
                  <X
                    className="h-3 w-3 cursor-pointer hover:bg-amber-200 rounded-full"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: {
                          start: format(
                            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                            "yyyy-MM-dd"
                          ),
                          end: format(new Date(), "yyyy-MM-dd"),
                        },
                      }));
                    }}
                  />
                </span>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md overflow-hidden">
          <Table>
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("employeeName")}
                >
                  Employee {getSortIcon("employeeName")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("date")}
                >
                  Date {getSortIcon("date")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("clockIn")}
                >
                  Clock In {getSortIcon("clockIn")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("clockOut")}
                >
                  Clock Out {getSortIcon("clockOut")}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("hoursWorked")}
                >
                  Hours {getSortIcon("hoursWorked")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {showAllColumns && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={showAllColumns ? 9 : 6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center">
                      <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Loading attendance data...
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((record, index) => (
                  <tr
                    key={`${record.employeeCode}-${record.employeeId}-${index}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6  whitespace-nowrap  text-gray-900">
                      <div>
                        <p className="font-medium mb-1">
                          {record.employeeName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {record.employeeCode} | {record.position}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {safeFormat(record.date, "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {record.clockIn
                        ? safeFormat(record.clockIn, "h:mm a")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {record.clockOut ? (
                        safeFormat(record.clockOut, "h:mm a")
                      ) : (
                        <span className="text-yellow-600 font-medium">
                          Still clocked in
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {record.clockOut ? (
                        `${(
                          calculateHours(record.clockIn, record.clockOut) ||
                          record.hoursWorked ||
                          0
                        ).toFixed(1)}h`
                      ) : record.hoursWorked ? (
                        <span className="text-blue-600">
                          {record.hoursWorked.toFixed(1)}h (ongoing)
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            record.status === "present"
                              ? "bg-green-100 text-green-800"
                              : record.status === "late_arrival"
                              ? "bg-yellow-100 text-yellow-800"
                              : record.status === "absent"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {getStatusLabel(record.status)}
                      </span>
                    </td>
                    {showAllColumns && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          <p> {record.location || "Not specified"}</p>
                          <p className="first-letter: capitalize">
                            {" "}
                            {record.shiftType}{" "}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {record.method || "-"}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={showAllColumns ? 9 : 6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    <div className="py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        No records found
                      </p>
                      <p className="text-sm text-gray-500">
                        {safeData.length === 0
                          ? "No attendance data available for the selected criteria"
                          : "Try adjusting your search or filter criteria"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing{" "}
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                processedData.length
              )}{" "}
              to {Math.min(currentPage * itemsPerPage, processedData.length)} of{" "}
              {processedData.length} records
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              Previous
            </Button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Filter Drawer 
     // Replace the Filter Drawer section in your component with this organized version:*/}

{/* Filter Drawer */}
<Drawer
  title="Filter Attendance Records"
  width={800}
  open={drawerVisible}
  onClose={() => setDrawerVisible(false)}
  styles={{
    body: { padding: 0 },
  }}
>
  <div className="h-full flex flex-col">
    {/* Filter Summary Header */}
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{processedData.length}</span> records found
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700 font-medium">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-sm text-gray-600 hover:text-gray-900"
          disabled={activeFiltersCount === 0}
        >
          Clear All Filters
        </Button>
      </div>
    </div>

    {/* Filter Content */}
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-8">
        
        {/* Date Range Filter - Full Width Priority */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Date Range</h3>
              <p className="text-sm text-gray-500">Filter records by date period</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        start: e.target.value,
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange,
                        end: e.target.value,
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Quick Date Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick Select
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Last 7 Days', days: 7 },
                  { label: 'Last 30 Days', days: 30 },
                  { label: 'Last 90 Days', days: 90 },
                ].map(({ label, days }) => (
                  <Button
                    key={label}
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const endDate = new Date();
                      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
                      setFilters(prev => ({
                        ...prev,
                        dateRange: {
                          start: format(startDate, 'yyyy-MM-dd'),
                          end: format(endDate, 'yyyy-MM-dd'),
                        }
                      }));
                    }}
                    className="text-sm justify-center"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Other Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Status Filter */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">Status</h3>
                <p className="text-sm text-gray-500">
                  {filters.status.length > 0 
                    ? `${filters.status.length} selected`
                    : 'All statuses'
                  }
                </p>
              </div>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.statuses.map((status) => (
                <label
                  key={status}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 ${
                    filters.status.includes(status)
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => toggleStatusFilter(status)}
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getStatusIndicatorColor(status)}`} />
                    <span className="text-sm font-medium">{getStatusLabel(status)}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Position Filter */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">Positions</h3>
                <p className="text-sm text-gray-500">
                  {filters.departments.length > 0 
                    ? `${filters.departments.length} selected`
                    : 'All positions'
                  }
                </p>
              </div>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.departments.map((dept) => (
                <label
                  key={dept}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 ${
                    filters.departments.includes(dept)
                      ? 'border-purple-200 bg-purple-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.departments.includes(dept)}
                    onChange={() => toggleDepartmentFilter(dept)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium flex-1">{dept}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Employee Filter - Full Width */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">Employees</h3>
              <p className="text-sm text-gray-500">
                {filters.employees.length > 0 
                  ? `${filters.employees.length} of ${filterOptions.employees.length} selected`
                  : `All ${filterOptions.employees.length} employees`
                }
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Employee Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees by name or code..."
                className="pl-10"
                value={employeeSearchTerm}
                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
              />
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const filteredEmployees = filterOptions.employees
                    .filter(emp => 
                      emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) || 
                      emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                    );
                  setFilters(prev => ({
                    ...prev,
                    employees: [...new Set([...prev.employees, ...filteredEmployees.map(e => e.code)])]
                  }));
                }}
                className="text-xs"
              >
                Select All Visible
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    employees: []
                  }));
                }}
                className="text-xs"
                disabled={filters.employees.length === 0}
              >
                Clear Selection
              </Button>
            </div>
            
            {/* Employee List */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <div className="divide-y divide-gray-200">
                {filterOptions.employees
                  .filter(emp => 
                    emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) || 
                    emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                  )
                  .map(({ code, name }) => (
                    <label
                      key={code}
                      className={`flex items-center gap-3 p-3 transition-all cursor-pointer hover:bg-gray-50 ${
                        filters.employees.includes(code) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.employees.includes(code)}
                        onChange={() => toggleEmployeeFilter(code)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                        <div className="text-xs text-gray-500">{code}</div>
                      </div>
                    </label>
                  ))}
                
                {filterOptions.employees.filter(emp => 
                  emp.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) || 
                  emp.code.toLowerCase().includes(employeeSearchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm">No employees found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Fixed Footer Actions */}
    <div className="px-6 py-4 border-t border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {activeFiltersCount > 0 && (
            <span>
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active • 
              <span className="font-medium"> {processedData.length} records</span>
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setDrawerVisible(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setDrawerVisible(false);
              setCurrentPage(1); // Reset to first page when applying filters
            }}
            className="min-w-[100px]"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  </div>
</Drawer>
    </div>
  );
};

export default AttendanceSheet;