'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from './ui/DataTable';
import { fetchTimeLogs, fetchEmployees, fetchLocations, fetchAttendanceStats } from '@/lib/mockData';
import TimeChart from './TimeChart';
import { ExportMenu } from './ui/ExportMenu';
import Pagination from './ui/Pagination';
import { Clock, Users, MapPin, Calendar, Filter, Clock as ClockIcon, ChevronDown, ChevronUp, Plus, Check, X, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Employee, Location } from '@/types/employee';
import { TimeLog } from "@/types/timeLogs";
import { SearchBar } from './ui/SearchBar';
import Label from './ui/label';
import Button from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/EmployeeCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import  Input from './ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ManualEntryModal } from './ui/ManualEntryModal';

type AttendanceStats = {
  present: {
    onTime: number;
    late: number;
    early: number;
  };
  absent: {
    absent: number;
    noClockIn: number;
    noClockOut: number;
    invalid: number;
    dayOff: number;
    timeOff: number;
  };
  trends: {
    onTime: string;
    late: string;
    early: string;
    absent: string;
    noClockIn: string;
  };
};

export default function TimeTrackerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters
  const [employeeId, setEmployeeId] = useState(searchParams.get('employeeId') || '');
  const [locationId, setLocationId] = useState(searchParams.get('locationId') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize')) || 20);

  // Stats
  const stats = useMemo(() => {
    const activeEmployees = logs.filter(log => log.status === 'active').length;
    const totalHours = logs.reduce((sum, log) => sum + (log.duration || 0), 0) / 60;
    
    return {
      activeEmployees,
      totalHours: Math.round(totalHours * 10) / 10,
      locationsCovered: new Set(logs.map(log => log.location?.name).filter(Boolean)).size
    };
  }, [logs]);

  // Update URL params
  const updateParams = () => {
    const params = new URLSearchParams();
    if (employeeId) params.set('employeeId', employeeId);
    if (locationId) params.set('locationId', locationId);
    if (date) params.set('date', date);
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    updateParams();
  }, [employeeId, locationId, date, status, search, page, pageSize]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [emp, locs, result, attendance] = await Promise.all([
          fetchEmployees(),
          fetchLocations(),
          fetchTimeLogs(page, pageSize, employeeId, locationId, date, status, search),
          fetchAttendanceStats(),
        ]);
        setEmployees(emp);
        setLocations(locs);
        setLogs(result.logs);
        setTotalItems(result.totalItems);
        setTotalPages(result.totalPages);
        setAttendanceStats(attendance);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [employeeId, locationId, date, status, search, page, pageSize]);

  const resetFilters = () => {
    setEmployeeId('');
    setLocationId('');
    setDate('');
    setStatus('');
    setSearch('');
    setPage(1);
  };

  const renderTrendIndicator = (trend: string) => {
    if (trend.startsWith('+')) {
      return <span className="text-green-500 flex items-center gap-1">{trend} <ChevronUp className="h-4 w-4" /></span>;
    } else if (trend.startsWith('-')) {
      return <span className="text-red-500 flex items-center gap-1">{trend} <ChevronDown className="h-4 w-4" /></span>;
    }
    return <span className="text-gray-500">{trend}</span>;
  };

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50 rounnded ">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking Dashboard</h1>
          <p className="text-gray-500">Monitor employee work hours and attendance</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="secondary" size="sm" className="gap-1 flex items-center">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <ExportMenu logs={logs} />
          <ManualEntryModal employees={employees} locations={locations} onSuccess={() => setPage(1)}>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </ManualEntryModal>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeEmployees}</div>
                <p className="text-xs text-muted-foreground">Currently working</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalHours}h</div>
                <p className="text-xs text-muted-foreground">Logged this period</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Locations</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.locationsCovered}</div>
                <p className="text-xs text-muted-foreground">Active locations</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Filters */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Recent Time Logs</CardTitle>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="gap-1 flex items-center"
                >
                  {isFilterOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show Filters
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SearchBar
                placeholder="Search employees, locations..."
                defaultValue={search}
                onSearch={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                className="mb-4"
              />
              
              {isFilterOpen && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="employee">Employee</Label>
                    <Select
                      value={employeeId}
                      onValueChange={(val) => {
                        setEmployeeId(val);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Employees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Employees</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} ({emp.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      value={locationId}
                      onValueChange={(val) => {
                        setLocationId(val);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Locations</SelectItem>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      type="date"
                      id="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={(val) => {
                        setStatus(val);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="active">On Duty</SelectItem>
                        <SelectItem value="inactive">Clocked Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-4 flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={resetFilters}
                      disabled={isLoading}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-10 w-full" />
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <DataTable
  headers={[
    'Employee',
    'Clock-in',
    'Clock-out',
    'Duration',
    'Location',
    'Status',
    'Actions'
  ]}
  data={logs.map((log) => ({
    id: log.id,
    values: [
      <div key="employee" className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
          {log.employeeName.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="space-y-1">
          <div className="font-medium">{log.employeeName}</div>
          <div className="text-sm text-gray-500">{log.employeeDepartment}</div>
        </div>
      </div>,
      <div key="clock-in" className="text-sm">
        {new Date(log.clockIn).toLocaleTimeString()}
      </div>,
      <div key="clock-out" className="text-sm">
        {log.clockOut ? (
          new Date(log.clockOut).toLocaleTimeString()
        ) : (
          <span className="text-gray-400">--</span>
        )}
      </div>,
      <div key="duration">
        {log.duration ? (
          <span className="font-medium">
            {Math.floor(log.duration / 60)}h {log.duration % 60}m
          </span>
        ) : (
          <span className="text-gray-400">--</span>
        )}
      </div>,
      <div key="location" className="flex items-center gap-2">
        {log.location ? (
          <>
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{log.location.name}</span>
          </>
        ) : (
          <span className="text-gray-400">Remote</span>
        )}
      </div>,
      <Badge 
        key="status"
        variant={log.status === 'active' ? 'default' : 'secondary'}
        className="flex items-center gap-1.5"
      >
        {log.status === 'active' ? (
          <>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            On Duty
          </>
        ) : (
          'Clocked Out'
        )}
      </Badge>,
      <div key="actions" className="flex gap-2">
        <Button variant="primary" size="sm" className="h-8">
          Edit
        </Button>
      </div>
    ],
  }))}
/>
                  
                  <CardFooter className="flex flex-col md:flex-row justify-between items-center p-4 border-t">
                    <div className="text-sm text-gray-600 mb-2 md:mb-0">
                      Showing {logs.length} of {totalItems} entries
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="pageSize" className="text-sm">
                          Rows:
                        </Label>
                        <Select
                          value={String(pageSize)}
                          onValueChange={(val) => {
                            setPageSize(Number(val));
                            setPage(1);
                          }}
                        >
                          <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                          </SelectTrigger>
                          <SelectContent>
                            {[10, 20, 50, 100].map(size => (
                              <SelectItem key={size} value={String(size)}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Pagination
                        currentPage={page}
                        totalCount={totalItems}
                        pageSize={pageSize}
                        onPageChange={setPage}
                      />
                    </div>
                  </CardFooter>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          {attendanceStats ? (
            <>
              {/* Present Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Present Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">On time</h3>
                          <p className="text-2xl font-bold mt-1">{attendanceStats.present.onTime}</p>
                        </div>
                        <div className="text-sm">
                          {renderTrendIndicator(attendanceStats.trends.onTime)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Late clock-in</h3>
                          <p className="text-2xl font-bold mt-1">{attendanceStats.present.late}</p>
                        </div>
                        <div className="text-sm">
                          {renderTrendIndicator(attendanceStats.trends.late)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Early clock-in</h3>
                          <p className="text-2xl font-bold mt-1">{attendanceStats.present.early}</p>
                        </div>
                        <div className="text-sm">
                          {renderTrendIndicator(attendanceStats.trends.early)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Not Present Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Not Present Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Absent</h3>
                          <p className="text-2xl font-bold mt-1">{attendanceStats.absent.absent}</p>
                        </div>
                        <div className="text-sm">
                          {renderTrendIndicator(attendanceStats.trends.absent)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">No clock-in</h3>
                          <p className="text-2xl font-bold mt-1">{attendanceStats.absent.noClockIn}</p>
                        </div>
                        <div className="text-sm">
                          {renderTrendIndicator(attendanceStats.trends.noClockIn)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">No clock-out</h3>
                          <p className="text-2xl font-bold mt-1">{attendanceStats.absent.noClockOut}</p>
                        </div>
                        <div className="text-sm">
                          {renderTrendIndicator('0 vs yesterday')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Invalid</h3>
                          <p className="text-2xl font-bold mt-1">{attendanceStats.absent.invalid}</p>
                        </div>
                        <div className="text-sm">
                          {renderTrendIndicator('0 vs yesterday')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Day off</h3>
                          <p className="text-2xl font-bold mt-1">{attendanceStats.absent.dayOff}</p>
                        </div>
                        <div className="text-sm">
                          {renderTrendIndicator('-2 vs yesterday')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Time off</h3>
                          <p className="text-2xl font-bold mt-1">{attendanceStats.absent.timeOff}</p>
                        </div>
                        <div className="text-sm">
                          {renderTrendIndicator('-6 vs yesterday')}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employee Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search Employee</CardTitle>
                </CardHeader>
                <CardContent>
                  <SearchBar
                    placeholder="Search employee name..."
                    defaultValue={search}
                    onSearch={(val) => {
                      setSearch(val);
                      setPage(1);
                    }}
                    className="mb-4"
                  />

                  <div className="space-y-4">
                    {employees.slice(0, 5).map(employee => (
                      <div key={employee.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{employee.name}</h3>
                            <p className="text-sm text-gray-500">{employee.id}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Clock-in/Out</Button>
                            <Button variant="outline" size="sm">Overtime</Button>
                            <Button variant="outline" size="sm">Picture</Button>
                            <Button variant="outline" size="sm">Location</Button>
                            <Button variant="outline" size="sm">Note</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Time Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-80 w-full rounded-lg" />}>
                <TimeChart logs={logs} locations={locations} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timesheets">
          <Card>
            <CardHeader>
              <CardTitle>Timesheets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-500">Timesheet view coming soon</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}