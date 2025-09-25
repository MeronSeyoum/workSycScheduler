"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Avatar,
  Flex,
  Typography,
  Drawer,
  Modal,
  Badge,
  Tooltip,
  notification,
  Card,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import EmployeeForm from "@/components/form/EmployeeForm";
import type { Employee } from "@/lib/types/employee";
import { Skeleton } from "@/components/ui/common/skeleton";
import EmployeeViewModal from "@/components/view/EmployeeViewModal";

const { Option } = Select;
const { Text } = Typography;

// Constants moved outside component to prevent recreation
const STATUS_OPTIONS = [
  "active",
  "on_leave", 
  "terminated",
  "inactive",
  "suspended",
] as const;

const POSITIONS = [
  "Manager",
  "Supervisor", 
  "Team Leader",
  "Cleaning Technician",
  "Janitor",
  "Sanitation Specialist",
  "Floor Care Specialist",
  "Window Cleaner",
  "Carpet Cleaner",
  "Restroom Attendant",
  "Waste Management Operator",
  "Disinfection Specialist",
  "Green Cleaning Specialist"
] as const;

const STATUS_COLOR_MAP = {
  active: "green",
  on_leave: "orange", 
  terminated: "red",
  inactive: "gray",
  suspended: "volcano",
} as const;

const PAGINATION_CONFIG = {
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ["10", "20", "50"],
  showQuickJumper: true,
  showTotal: (total: number) => `Total ${total} employees`,
};

// Custom hook for notifications - prevents recreation on every render
const useNotifications = () => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    description?: string
  ) => {
    const icons = {
      success: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      error: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
      warning: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      info: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
    };

    api[type]({
      message,
      description,
      icon: icons[type],
      placement: "topRight",
      duration: type === 'error' || type === 'warning' ? 4 : 3,
    });
  }, [api]);

  return { showNotification, contextHolder };
};

// Custom hook for employee data management
const useEmployeeData = (token: string | null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotifications();

  const fetchEmployees = useCallback(async () => {
    if (!token) {
      showNotification("warning", "Authentication Required", "Please login to access employee data");
      return;
    }

    setLoading(true);
    try {
      const response = await api.employees.fetchEmployees(token);
      const employeeData: Employee[] = Array.isArray(response) ? response : response || [];
      setEmployees(employeeData);
      console.log(employeeData)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load employees";
      showNotification("error", "Loading Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, showNotification]);

  return { employees, loading, fetchEmployees, setEmployees };
};

// Custom hook for locations data
const useLocations = (token: string | null) => {
  const [locations, setLocations] = useState<any[]>([]);
  const { showNotification } = useNotifications();

  const fetchLocations = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await api.clients.fetchClients(token);
      const locationData = Array.isArray(response) ? response : response || [];
      setLocations(locationData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load locations";
      showNotification("error", "Locations Failed", errorMessage);
    }
  }, [token, showNotification]);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return { locations };
};

const EmployeePage: React.FC = () => {
  const { token } = useAuth();
  const { showNotification, contextHolder } = useNotifications();
  const { employees, loading, fetchEmployees } = useEmployeeData(token);
  const { locations } = useLocations(token);

  // UI State
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  const [viewModalVisible, setViewModalVisible] = useState(false);
const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);


  // Memoized filtered employees - only recalculates when dependencies change
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.first_name?.toLowerCase().includes(term) ||
          emp.last_name?.toLowerCase().includes(term) ||
          emp.email?.toLowerCase().includes(term) ||
          emp.position?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((emp) => emp.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== "all") {
      result = result.filter((emp) => emp.position === departmentFilter);
    }

    // Location filter
    if (locationFilter !== "all") {
      result = result.filter((emp) => 
        emp.assigned_locations && emp.assigned_locations.includes(locationFilter)
      );
    }

    return result;
  }, [employees, searchTerm, statusFilter, departmentFilter, locationFilter]);

  // CRUD Operations
  const handleCreate = useCallback(async (values: Omit<Employee, "id">) => {
    setFormLoading(true);
    try {
      await api.employees.createEmployee(values, token!);
      showNotification("success", "Employee Created", `${values.first_name} ${values.last_name} added successfully`);
      setDrawerVisible(false);
      await fetchEmployees();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create employee";
      showNotification("error", "Creation Failed", errorMessage);
    } finally {
      setFormLoading(false);
    }
  }, [token, showNotification, fetchEmployees]);

  const handleUpdate = useCallback(async (values: Employee) => {
    setFormLoading(true);
    try {
      await api.employees.updateEmployee(values.id, values, token!);
      showNotification("success", "Employee Updated", `${values.first_name} ${values.last_name} updated successfully`);
      setDrawerVisible(false);
      await fetchEmployees();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update employee";
      showNotification("error", "Update Failed", errorMessage);
    } finally {
      setFormLoading(false);
    }
  }, [token, showNotification, fetchEmployees]);

  const handleDelete = useCallback(async (id: number) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return;

    Modal.confirm({
      title: "Confirm Delete",
      // icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${employee.first_name} ${employee.last_name}? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await api.employees.deleteEmployee(id, token!);
          showNotification("success", "Employee Deleted", `${employee.first_name} ${employee.last_name} was removed`);
          await fetchEmployees();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete employee";
          showNotification("error", "Deletion Failed", errorMessage);
        }
      },
      onCancel: () => {
        showNotification("info", "Deletion Cancelled", "Employee was not deleted");
      },
    });
  }, [employees, token, showNotification, fetchEmployees]);


  const handleView = useCallback((employee: Employee) => {
  setViewingEmployee(employee);
  setViewModalVisible(true);
}, []);


  // Memoized table columns to prevent recreation on every render
  const columns: ColumnsType<Employee> = useMemo(() => [
    {
      title: "EMPLOYEE",
      key: "employee",
      width: 250,
      fixed: "left",
      render: (_, record) => (
        <Flex align="center" gap={12}>
          <Badge dot color={STATUS_COLOR_MAP[record.status]} offset={[-5, 40]}>
            <Avatar
              size={44}
              src={record.profile_image_url}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#0F6973" }}
            />
          </Badge>
          <div className="flex flex-col gap-1">
            <Text strong style={{ fontSize: 16, color: '#0F6973', lineHeight: 1.2 }}>
              {record.first_name} {record.last_name}
            </Text>
            <div className="flex items-center gap-1">
              <TeamOutlined style={{ fontSize: 14, color: "#8c8c8c" }} />
              <Text type="secondary" style={{ fontSize: 14 }}>
                {record.position}
              </Text>
            </div>
            <div className="flex items-center gap-1">
              <MailOutlined style={{ fontSize: 14, color: "#8c8c8c" }} />
              <Text type="secondary" style={{ fontSize: 14 }}>
                {record.email}
              </Text>
            </div>
          </div>
        </Flex>
      ),
      sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
    },
    {
      title: "ASSIGNED LOCATIONS",
      key: "assigned_locations",
      width: 250,
      render: (_, record) => (
        <div className="space-y-2">
          {record.assigned_locations && record.assigned_locations.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {record.assigned_locations.slice(0, 2).map((location: string, index: number) => (
                <Tag
                  key={index}
                  color="blue"
                  style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 8,
                    margin: "1px"
                  }}
                >
                  {location.length > 25 ? `${location.substring(0, 25)}...` : location}
                </Tag>
              ))}
              {record.assigned_locations.length > 2 && (
                <Tooltip title={record.assigned_locations.slice(2).join(', ')}>
                  <Tag
                    color="geekblue"
                    style={{
                      fontSize: 12,
                      padding: "4px 8px",
                      borderRadius: 8,
                      margin: "1px"
                    }}
                  >
                    +{record.assigned_locations.length - 2} more
                  </Tag>
                </Tooltip>
              )}
            </div>
          ) : (
            <Text type="secondary" style={{ fontSize: 14 }}>
              No locations assigned
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "CONTACT",
      key: "contact",
      width: 250,
      render: (_, record) => (
        <div className="space-y-2">
          {record.contact?.address && (
            <div className="flex items-start gap-2">
              <EnvironmentOutlined style={{ color: "#0F6973", fontSize: 14, marginTop: 2 }} />
              <Text style={{ fontSize: 14, lineHeight: 1.3 }}>
                {record.contact.address.length > 50 
                  ? `${record.contact.address.substring(0, 50)}...` 
                  : record.contact.address}
              </Text>
            </div>
          )}
          {record.contact?.phone && (
            <div className="flex items-center gap-2">
              <PhoneOutlined style={{ color: "#0F6973", fontSize: 14 }} />
              <Text style={{ fontSize: 14 }}>{record.contact.phone}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "STATUS",
      key: "status",
      width: 100,
      filters: STATUS_OPTIONS.map((status) => ({
        text: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
      render: (_, record) => (
        <Tag
          color={STATUS_COLOR_MAP[record.status]}
          style={{
            padding: "6px 12px",
            borderRadius: 16,
            textTransform: "capitalize",
            fontWeight: 500,
            fontSize: 13,
            border: 'none',
            minWidth: 80,
            textAlign: "center",
          }}
        >
          {record.status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: "HIRE DATE",
      key: "hire_date",
      width: 120,
      render: (_, record) => (
        <Tooltip title={`Hired ${dayjs().diff(dayjs(record.hire_date), "month")} months ago`}>
          <div className="flex items-center gap-2">
            <CalendarOutlined style={{ color: "#0F6973", fontSize: 14 }} />
            <Text style={{ fontSize: 14 }}>{dayjs(record.hire_date).format("MMM D, YYYY")}</Text>
          </div>
        </Tooltip>
      ),
      sorter: (a, b) => dayjs(a.hire_date).unix() - dayjs(b.hire_date).unix(),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size={8}>
          <Tooltip title="View employee details">
          <Button
            type="text"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            style={{ color: '#0F6973' }}
          />
        </Tooltip>
          <Tooltip title="Edit employee">
            <Button
              type="text"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentEmployee(record);
                setDrawerVisible(true);
              }}
              style={{ color: '#0F6973' }}
            />
          </Tooltip>
          <Tooltip title="Delete employee">
            <Button
              type="text"
              shape="circle"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [handleDelete]); // Added handleDelete to dependencies

  // Load data on mount
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Event handlers
  const handleAddEmployee = useCallback(() => {
    setCurrentEmployee(null);
    setDrawerVisible(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerVisible(false);
    setCurrentEmployee(null);
  }, []);

  // Debounced search to prevent excessive filtering
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  if (loading && employees.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="min-h-screen" style={{ fontSize: '15px' }}>
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
            <div>
              <p className="text-gray-600" style={{ fontSize: '16px' }}>Manage your team members and their information</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddEmployee}
              style={{ backgroundColor: '#0F6973', borderColor: '#0F6973' }}
              size="large"
            >
              Add Employee
            </Button>
          </Flex>
        </div>

        <div className="py-6">
          <Card>
            {/* Filters */}
            <div className="mb-6">
              <Flex gap={16} wrap="wrap" align="center">
                <Input
                  placeholder="Search employees..."
                  prefix={<SearchOutlined />}
                  style={{ width: 300, fontSize: '15px' }}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                />
                <Select
                  placeholder="Filter by status"
                  style={{ width: 160, fontSize: '15px' }}
                  onChange={setStatusFilter}
                  allowClear
                  value={statusFilter === "all" ? undefined : statusFilter}
                >
                  <Option value="all">All Statuses</Option>
                  {STATUS_OPTIONS.map((status) => (
                    <Option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </Option>
                  ))}
                </Select>
                <Select
                  placeholder="Filter by position"
                  style={{ width: 180, fontSize: '15px' }}
                  onChange={setDepartmentFilter}
                  allowClear
                  value={departmentFilter === "all" ? undefined : departmentFilter}
                >
                  <Option value="all">All Positions</Option>
                  {POSITIONS.map((position) => (
                    <Option key={position} value={position}>
                      {position}
                    </Option>
                  ))}
                </Select>
                <Select
                  placeholder="Filter by location"
                  style={{ width: 180, fontSize: '15px' }}
                  onChange={setLocationFilter}
                  allowClear
                  value={locationFilter === "all" ? undefined : locationFilter}
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                >
                  <Option value="all">All Locations</Option>
                  {locations.map((location) => (
                    <Option key={location.id} value={location.business_name}>
                      {location.business_name}
                    </Option>
                  ))}
                </Select>
                <div className="ml-auto">
                  <Text type="secondary" style={{ fontSize: '15px' }}>
                    Showing {filteredEmployees.length} of {employees.length} employees
                  </Text>
                </div>
              </Flex>
            </div>

            {/* Table */}
            <Table
              columns={columns}
              dataSource={filteredEmployees}
              rowKey="id"
              loading={loading}
              pagination={PAGINATION_CONFIG}
              scroll={{ x: 1000 }}
              bordered={false}
              size="middle"
              className="employee-table"
              locale={{
                emptyText: (
                  <div className="py-12 text-center">
                    <UserOutlined className="text-6xl text-gray-300 mb-4" />
                    <Text type="secondary" className="block text-lg mb-4" style={{ fontSize: '16px' }}>
                      {employees.length === 0
                        ? "No employees in the system yet"
                        : "No matching employees found"}
                    </Text>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddEmployee}
                      style={{ backgroundColor: '#0F6973', borderColor: '#0F6973' }}
                    >
                      Add Employee
                    </Button>
                  </div>
                ),
              }}
              rowClassName={(record, index) => 
                index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
              }
            />
          </Card>
        </div>
{/* mployeeViewModal component  */}
<EmployeeViewModal
  employee={viewingEmployee}
  visible={viewModalVisible}
  onClose={() => setViewModalVisible(false)}
/>

        {/* Form Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-3" style={{ fontSize: '18px' }}>
              <UserOutlined />
              {currentEmployee ? "Edit Employee" : "Add Employee"}
            </div>
          }
          width={720}
          open={drawerVisible}
          onClose={handleDrawerClose}
          styles={{ body: { padding: "24px 0" } }}
          destroyOnClose
        >
          <EmployeeForm
            initialValues={currentEmployee || undefined}
            onSubmit={currentEmployee ? handleUpdate : handleCreate}
            loading={formLoading}
            locations={locations}
          />
        </Drawer>
      </div>

      <style jsx global>{`
        .employee-table .ant-table-thead > tr > th {
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;
          font-size: 15px;
        }

        .employee-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f3f4;
          padding: 16px;
          font-size: 15px;
        }

        .table-row-even {
          background-color: #fafafa;
        }

        .table-row-odd {
          background-color: #ffffff;
        }

        .employee-table .ant-table-tbody > tr:hover > td {
          background-color: #f0f9ff !important;
        }

        .ant-table-pagination.ant-pagination {
          font-size: 15px;
        }

        .ant-btn {
          font-size: 15px;
        }

        .ant-tag {
          font-size: 13px;
        }

        .ant-input, .ant-select-item {
          font-size: 15px;
        }
      `}</style>
    </>
  );
};

export default EmployeePage;