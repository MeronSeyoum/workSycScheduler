import { useState } from "react";
import { Table } from "@/components/ui/Table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/attendance/AttendanceCard";
import  Input  from "@/components/ui/Input";
import  Button  from "@/components/ui/Button";
import { Search, Filter, Download, ChevronDown, ChevronUp } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  date: string;
  clockIn: string;
  clockOut: string;
  status: string;
  hoursWorked: string;
  shiftType: string;
  location: string;
  method: string;
}

const AttendanceSheet = ({ data = [], showAllColumns = false }: { data?: AttendanceRecord[], showAllColumns?: boolean }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof AttendanceRecord; direction: 'ascending' | 'descending' } | null>(null);

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];


  const requestSort = (key: keyof AttendanceRecord) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...safeData];
  if (sortConfig !== null) {
    sortedData.sort((a, b) => {
      // Special handling for time fields
      if (sortConfig.key === 'clockIn' || sortConfig.key === 'clockOut') {
        const timeToMinutes = (time: string) => {
          if (!time) return 0;
          const [timePart, period] = time.split(' ');
          const [hours, minutes] = timePart.split(':');
          const hourValue = parseInt(hours) % 12 + (period === 'PM' ? 12 : 0);
          return hourValue * 60 + parseInt(minutes);
        };
        const aTime = timeToMinutes(a[sortConfig.key]);
        const bTime = timeToMinutes(b[sortConfig.key]);
        return sortConfig.direction === 'ascending' ? aTime - bTime : bTime - aTime;
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const filteredData = sortedData.filter(record =>
    record.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSortIcon = (key: keyof AttendanceRecord) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' 
      ? <ChevronUp className="ml-1 h-4 w-4 inline" /> 
      : <ChevronDown className="ml-1 h-4 w-4 inline" />;
  };

  // Format time for display
 

  const safeFormat = (dateString: string, formatString: string) => {
    try {
      return format(new Date(dateString), formatString);
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4 ">
      <Card className="border-transparent border-0">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-xl">Attendance Records</CardTitle>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search employees..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="primary" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="primary" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md  overflow-hidden">
            <Table>
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('employeeName')}
                  >
                    Employee {getSortIcon('employeeName')}
                  </th>
                  {/* <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('employeeId')}
                  >
                    ID {getSortIcon('employeeId')}
                  </th> */}
                  {/* {showAllColumns && (
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('employeeCode')}
                    >
                      Code {getSortIcon('employeeCode')}
                    </th>
                  )} */}
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('date')}
                  >
                    Date {getSortIcon('date')}
                    
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('clockIn')}
                  >
                    Clock In {getSortIcon('clockIn')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('clockOut')}
                  >
                    Clock Out {getSortIcon('clockOut')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('hoursWorked')}
                  >
                    Hours {getSortIcon('hoursWorked')}
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
                {filteredData.length > 0 ? (
                  filteredData.map((record) => (
                    <tr key={`${record.id}-${record.employeeId}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      <p>{record.employeeName}</p>  
                       <p className="text-sm font-normal text-gray-500">   {record.employeeCode} | {record.shiftType}</p>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {record.employeeId}
                      </td> */}
                     
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {/* {record.date} */}
                         {safeFormat(record.date, 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                         {safeFormat(record.clockIn, 'HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {safeFormat(record.clockOut, 'HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                         {record.hoursWorked ? `${record.hoursWorked.toFixed(1)}h` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${record.status === 'present' || record.status === 'online' 
                            ? 'bg-green-100 text-green-800' 
                            : record.status === 'late' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'}`}>
                          {record.status}
                        </span>
                      </td>
                      {showAllColumns && (
                        <>
                         
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {record.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {record.method}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={showAllColumns ? 11 : 7} className="px-6 py-4 text-center text-gray-500">
                      {safeData.length === 0 ? 'No attendance data available' : 'No matching records found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>Showing {filteredData.length} of {safeData.length} records</div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" disabled>
                Previous
              </Button>
              <Button variant="primary" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSheet;