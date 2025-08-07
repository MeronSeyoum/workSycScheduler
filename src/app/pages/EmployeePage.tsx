"use client";
import React, { useState, useEffect, useCallback } from "react";
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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/service/api"; // Updated import
import EmployeeForm from "@/components/form/EmployeeForm";
import type { Employee } from "@/types/employee";
import { Skeleton } from "@/components/ui/skeleton";

const { Option } = Select;
const { Text } = Typography;

const statusOptions = [
  "active",
  "on_leave",
  "terminated",
  "inactive",
  "suspended",
] as const;

const position = [
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

const statusColorMap = {
  active: "green",
  on_leave: "orange",
  terminated: "red",
  inactive: "gray",
  suspended: "volcano",
};

const EmployeePage: React.FC = () => {
  const { token } = useAuth();
  const [apiNotification, contextHolder] = notification.useNotification();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [locations, setLocations] = useState<any []>([]);

  const showSuccessNotification = (message: string, description?: string) => {
    apiNotification.success({
      message,
      description,
      icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      placement: "topRight",
      duration: 3,
    });
  };

  const showErrorNotification = (message: string, description?: string) => {
    apiNotification.error({
      message,
      description,
      icon: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
      placement: "topRight",
      duration: 4,
    });
  };

  const showWarningNotification = (message: string, description?: string) => {
    apiNotification.warning({
      message,
      description,
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      placement: "topRight",
      duration: 4,
    });
  };

  const showInfoNotification = (message: string, description?: string) => {
    apiNotification.info({
      message,
      description,
      icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
      placement: "topRight",
      duration: 3,
    });
  };

  const fetchEmployees = useCallback(async () => {
    if (!token) {
      showWarningNotification(
        "Authentication Required",
        "Please login to access employee data"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.employees.fetchEmployees(token);
      const employeeData: Employee[] = Array.isArray(response)
        ? response
        : response || [];
      setEmployees(employeeData);
      setFilteredEmployees(employeeData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load employees";
      showErrorNotification("Loading Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, showWarningNotification, showWarningNotification]);

  const fetchLocations = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.clients.fetchClients(token);
      const locationData = Array.isArray(response)
        ? response
        : response || [];
      setLocations(locationData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load locations";
      showErrorNotification("Locations Failed", errorMessage);
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
    fetchLocations();
  }, [fetchEmployees, fetchLocations]);

  useEffect(() => {
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

    if (statusFilter !== "all") {
      result = result.filter((emp) => emp.status === statusFilter);
      showInfoNotification(
        "Status Filtered",
        `Showing ${statusFilter} employees`
      );
    }

    if (departmentFilter !== "all") {
      result = result.filter((emp) => emp.position === departmentFilter);
    }

    setFilteredEmployees(result);
  }, [employees, searchTerm, statusFilter, departmentFilter]);

  const handleCreate = async (values: Omit<Employee, "id">) => {
    setFormLoading(true);
    try {
      await api.employees.createEmployee(values, token!);
      showSuccessNotification(
        "Employee Created",
        `${values.first_name} ${values.last_name} added successfully`
      );
      setDrawerVisible(false);
      await fetchEmployees();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create employee";
      showErrorNotification("Creation Failed", errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (values: Employee) => {
    setFormLoading(true);
    try {
      console.log("employee update values: ",values);
      await api.employees.updateEmployee(values.id, values, token!);
      showSuccessNotification(
        "Employee Updated",
        `${values.first_name} ${values.last_name} updated successfully`
      );
      setDrawerVisible(false);
      await fetchEmployees();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update employee";
      showErrorNotification("Update Failed", errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return;

    Modal.confirm({
      title: "Confirm Delete",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${employee.first_name} ${employee.last_name}? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await api.employees.deleteEmployee(id, token!);
          showSuccessNotification(
            "Employee Deleted",
            `${employee.first_name} ${employee.last_name} was removed`
          );
          await fetchEmployees();
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to delete employee";
          showErrorNotification("Deletion Failed", errorMessage);
        }
      },
      onCancel: () => {
        showInfoNotification("Deletion Cancelled", "Employee was not deleted");
      },
    });
  };

  const columns: ColumnsType<Employee> = [
    {
      title: "EMPLOYEE",
      key: "employee",
      width: 200,
      fixed: "left",
      render: (_, record) => (
        <Flex align="center" gap={12}>
          <Badge dot color={statusColorMap[record.status]} offset={[-5, 40]}>
            <Avatar
              size={40}
              src={record.profile_image_url}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#7265e6" }}
            />
          </Badge>
          <div className="flex flex-col">
            <Text strong style={{ display: "block", fontSize: 14 , color: '#0F6973' }}>
              {record.first_name} {record.last_name}
            </Text>
            
            <Text type="secondary" style={{ fontSize: 12 }}>
              <TeamOutlined style={{ marginRight: 4 }} />
              {record.position}
            </Text >
           
            <Text  type="secondary" style={{ fontSize: 12 }}>
             <MailOutlined style={{ color: "", marginRight: 4}} />
             {record.email}
             </Text>
          </div>
        </Flex>
      ),
      sorter: (a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(
          `${b.first_name} ${b.last_name}`
        ),
    },
    {
      title: "CONTACT",
      key: "contact",
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 6 }}>
            <EnvironmentOutlined style={{ color: "#0F6973", marginRight: 8 }} />
            <Text style={{fontSize: 12}}>{record.contact?.address}</Text>
          </div>
          
          {record.contact?.phone && (
            <div>
              <PhoneOutlined style={{ color: "#0F6973", marginRight: 8 }} />
              <Text style={{fontSize: 11}}>{record.contact?.phone}</Text>
            </div>
          )}
          </div>
      ),
    },
    {
      title: "STATUS",
      key: "status",
      width: 120,
      filters: statusOptions.map((status) => ({
        text: status.charAt(0).toUpperCase() + status.slice(1),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
      render: (_, record) => (
        <Tag
          color={statusColorMap[record.status]}
          style={{
            padding: "4px 8px",
            borderRadius: 12,
            textTransform: "uppercase",
            fontWeight: 500,
            width: 80,
            textAlign: "center",
          }}
        >
          {record.status}
        </Tag>
      ),
    },
    {
      title: "HIRE DATE",
      key: "hire_date",
      width: 140,
      render: (_, record) => (
        <Tooltip
          title={`Hired ${dayjs().diff(
            dayjs(record.hire_date),
            "month"
          )} months ago`}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined style={{ marginRight: 8, color: "#722ed1" }} />
            <Text >{dayjs(record.hire_date).format("MMM D, YYYY")}</Text>
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
        <Space>
          <Tooltip title="Edit employee">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentEmployee(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete employee">
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
       {loading? (
                      <div className="p-4 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : (
      <div className=" mt-4 p-2">
        <div>
          <div style={{ marginBottom: 24 }} className="flex justify-between">
            <Flex gap={16} wrap="wrap">
              <Input
                placeholder="Search employees..."
                prefix={<SearchOutlined />}
                style={{ width: 280 }}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
              <Select
                placeholder="Filter by status"
                style={{ width: 180 }}
                onChange={(value: string) => setStatusFilter(value)}
                allowClear
                value={statusFilter}
              >
                <Option value="all">All Statuses</Option>
                {statusOptions.map((status) => (
                  <Option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by department"
                style={{ width: 180 }}
                onChange={(value: string) => setDepartmentFilter(value)}
                allowClear
                value={departmentFilter}
              >
                <Option value="all">All Departments</Option>
                {position.map((position) => (
                  <Option key={position} value={position}>
                    {position}
                  </Option>
                ))}
              </Select>
            </Flex>

            <div className="flex justify-end">
              <Button
                style={{backgroundColor: '#0F6973', color:'white'}}
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentEmployee(null);
                  setDrawerVisible(true);
                }}
              >
                Add Employee
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) => `Total ${total} employees`,
            }}
            scroll={{ x: 900 }}
            style={{ marginTop: 16,
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
             }}
            bordered
            size="middle"
            locale={{
              emptyText: (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <UserOutlined
                    style={{ fontSize: 48, color: "#bfbfbf", marginBottom: 16 }}
                  />
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 16 }}
                  >
                    {employees.length === 0
                      ? "No employees in the system yet"
                      : "No matching employees found"}
                  </Text>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setCurrentEmployee(null);
                      setDrawerVisible(true);
                    }}
                    style={{ marginTop: 16 }}
                  >
                    Add Employee
                  </Button>
                </div>
              ),
            }}
          />
        </div>

        <Drawer
          title={currentEmployee ? "Edit Employee" : "Add Employee"}
          width={720}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          styles={{
            body: { padding: "24px 0" },
          }}
        >
          <EmployeeForm
            initialValues={currentEmployee || undefined}
            onSubmit={currentEmployee ? handleUpdate : handleCreate}
            loading={formLoading}
            locations={locations}
          />
        </Drawer>
      </div>
                    )}
    </>
  );
};

export default EmployeePage;