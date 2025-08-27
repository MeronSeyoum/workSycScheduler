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
} from "lucide-react";
import {
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import { AttendanceRecord } from "@/lib/types/attendance";

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

const AttendanceSheet = ({
  data = [],
  showAllColumns = false,
  // employees = [],
  onRefresh,
  isLoading = false,
}: AttendanceSheetProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AttendanceRecord;
    direction: "ascending" | "descending";
  }>({
    key: "date",
    direction: "descending", // Changed to descending to show latest first
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    employees: [],
    dateRange: {
      start: format(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd"
      ), // 30 days ago
      end: format(new Date(), "yyyy-MM-dd"), // today
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
        safeData.map(
          (record) => record.employeeCode || String(record.employeeId)
        )
      ),
    ];
    const statuses = [
      ...new Set(safeData.map((record) => record.status)),
    ].filter(Boolean);
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
      setCurrentPage(1); // Reset to first page when sorting
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
          const timeToMinutes = (time: string) => {
            if (!time) return 0;
            try {
              const date = parseISO(time);
              return date.getHours() * 60 + date.getMinutes();
            } catch {
              return 0;
            }
          };
          const aTime = timeToMinutes(a[sortConfig.key]);
          const bTime = timeToMinutes(b[sortConfig.key]);
          return sortConfig.direction === "ascending"
            ? aTime - bTime
            : bTime - aTime;
        }

        // Special handling for date fields
        if (sortConfig.key === "date") {
          try {
            const aDate = parseISO(a[sortConfig.key]);
            const bDate = parseISO(b[sortConfig.key]);
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
        ), // 30 days ago
        end: format(new Date(), "yyyy-MM-dd"), // today
      },
      status: [],
      departments: [],
    });
    setCurrentPage(1);
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
                    ? ` for ${safeFormat(
                        filters.dateRange.start,
                        "MMM d, yyyy"
                      )}`
                    : ` from ${safeFormat(
                        filters.dateRange.start,
                        "MMM d"
                      )} to ${safeFormat(
                        filters.dateRange.end,
                        "MMM d, yyyy"
                      )}`}
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
                  variant="primary"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
                      className={`mr-2 h-4 w-4 ${
                        isLoading ? "animate-spin" : ""
                      }`}
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

            {/* Filter Panel */}
            {showFilters && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Filters</h3>
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Range
                    </label>
                    <div className="space-y-2">
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
                      />
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
                      />
                    </div>
                  </div>

                  {/* Employee Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employees
                    </label>
                    <select
                      multiple
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={filters.employees}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        setFilters((prev) => ({
                          ...prev,
                          employees: selected,
                        }));
                      }}
                    >
                      {filterOptions.employees.map((empCode) => (
                        <option key={empCode} value={empCode}>
                          {empCode}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      multiple
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={filters.status}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        setFilters((prev) => ({ ...prev, status: selected }));
                      }}
                    >
                      {filterOptions.statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Position/Department Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      multiple
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={filters.departments}
                      onChange={(e) => {
                        const selected = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        setFilters((prev) => ({
                          ...prev,
                          departments: selected,
                        }));
                      }}
                    >
                      {filterOptions.departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Filters Display */}
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.employees.map(empCode => (
  <span key={empCode} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
    {empCode}
    <X 
      className="ml-1 h-3 w-3 cursor-pointer" 
      onClick={() => removeEmployeeFilter(empCode)}
    />
  </span>
))}
                    {filters.status.map((status) => (
                      <span
                        key={status}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center"
                      >
                        {status}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeStatusFilter(status)}
                        />
                      </span>
                    ))}
                    {filters.departments.map((dept) => (
                      <span
                        key={dept}
                        className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center"
                      >
                        {dept}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={() => removeDepartmentFilter(dept)}
                        />
                      </span>
                    ))}
                  </div>
                )}
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
                              : record.status === "late"
                              ? "bg-yellow-100 text-yellow-800"
                              : record.status === "absent"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {record.status}
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
                to {Math.min(currentPage * itemsPerPage, processedData.length)}{" "}
                of {processedData.length} records
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
                      variant={
                        currentPage === pageNum ? "primary" : "secondary"
                      }
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
    </div>
  );
};

export default AttendanceSheet;