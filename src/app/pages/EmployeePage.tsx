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
  Row,
  Col,
  Popconfirm,
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
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import EmployeeForm from "@/components/form/EmployeeForm";
import type { Employee } from "@/lib/types/employee";
import { Skeleton } from "@/components/ui/common/skeleton";
import EmployeeViewModal from "@/components/view/EmployeeViewModal";

dayjs.extend(relativeTime);

const { Option } = Select;
const { Text } = Typography;

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
  "Green Cleaning Specialist",
] as const;

const STATUS_COLOR_MAP = {
  active: "success",
  on_leave: "warning",
  terminated: "error",
  inactive: "default",
  suspended: "error",
} as const;

const STATUS_ICON_MAP = {
  active: <CheckCircleOutlined />,
  on_leave: <ExclamationCircleOutlined />,
  terminated: <CloseCircleOutlined />,
  inactive: <CloseCircleOutlined />,
  suspended: <CloseCircleOutlined />,
} as const;

const PAGINATION_CONFIG = {
  pageSize: 10,
  showSizeChanger: true,
  pageSizeOptions: ["5", "10", "20", "50"],
  showQuickJumper: true,
  showTotal: (total: number) => `Total ${total} employees`,
};

const useNotifications = () => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = useCallback(
    (
      type: "success" | "error" | "warning" | "info",
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
        duration: type === "error" || type === "warning" ? 4 : 3,
      });
    },
    [api]
  );

  return { showNotification, contextHolder };
};

const useEmployeeData = (token: string | null) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotifications();

  const fetchEmployees = useCallback(async () => {
    if (!token) {
      showNotification(
        "warning",
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load employees";
      showNotification("error", "Loading Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, showNotification]);

  return { employees, loading, fetchEmployees, setEmployees };
};

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
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load locations";
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

  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    let result = [...employees];

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
    }

    if (departmentFilter !== "all") {
      result = result.filter((emp) => emp.position === departmentFilter);
    }

    if (locationFilter !== "all") {
      result = result.filter(
        (emp) =>
          emp.assigned_locations &&
          emp.assigned_locations.includes(locationFilter)
      );
    }

    return result;
  }, [employees, searchTerm, statusFilter, departmentFilter, locationFilter]);

  const handleCreate = useCallback(
    async (values: Omit<Employee, "id">) => {
      setFormLoading(true);
      try {
        await api.employees.createEmployee(values, token!);
        showNotification(
          "success",
          "Employee Created",
          `${values.first_name} ${values.last_name} added successfully`
        );
        setDrawerVisible(false);
        await fetchEmployees();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create employee";
        showNotification("error", "Creation Failed", errorMessage);
      } finally {
        setFormLoading(false);
      }
    },
    [token, showNotification, fetchEmployees]
  );

  const handleUpdate = useCallback(
    async (values: Employee) => {
      setFormLoading(true);
      try {
        await api.employees.updateEmployee(values.id, values, token!);
        showNotification(
          "success",
          "Employee Updated",
          `${values.first_name} ${values.last_name} updated successfully`
        );
        setDrawerVisible(false);
        await fetchEmployees();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update employee";
        showNotification("error", "Update Failed", errorMessage);
      } finally {
        setFormLoading(false);
      }
    },
    [token, showNotification, fetchEmployees]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      const employee = employees.find((e) => e.id === id);
      if (!employee) return;

      Modal.confirm({
        title: "Delete Employee",
        content: `This action cannot be undone. Are you sure you want to delete ${employee.first_name} ${employee.last_name}?`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await api.employees.deleteEmployee(id, token!);
            showNotification(
              "success",
              "Employee Deleted",
              `${employee.first_name} ${employee.last_name} was removed`
            );
            await fetchEmployees();
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to delete employee";
            showNotification("error", "Deletion Failed", errorMessage);
          }
        },
        onCancel: () => {
          showNotification(
            "info",
            "Deletion Cancelled",
            "Employee was not deleted"
          );
        },
      });
    },
    [employees, token, showNotification, fetchEmployees]
  );

  const handleView = useCallback((employee: Employee) => {
    setViewingEmployee(employee);
    setViewModalVisible(true);
  }, []);

  const columns: ColumnsType<Employee> = useMemo(
    () => [
      {
        title: "Employee",
        key: "employee",
        width: "20%",
        fixed: "left",
        render: (_, record) => (
          <div className="py-2">
            <Row gutter={[12, 4]} align="middle" wrap={false}>
              <Col flex="none">
                <Badge
                  dot
                  color={
                    record.status === "active"
                      ? "#52c41a"
                      : record.status === "on_leave"
                        ? "#faad14"
                        : "#ff4d4f"
                  }
                  offset={[-5, 35]}
                >
                  <Avatar
                    size={44}
                    src={record.profile_image_url}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#009688" }}
                  />
                </Badge>
              </Col>
              <Col flex="auto" style={{ minWidth: 0 }}>
                <div className="font-semibold text-gray-900 truncate">
                  {record.first_name} {record.last_name}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <TeamOutlined />
                  <span className="truncate">{record.position}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MailOutlined />
                  <span className="truncate">{record.email}</span>
                </div>
              </Col>
            </Row>
          </div>
        ),
        sorter: (a, b) =>
          `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          ),
      },
      {
        title: "Assigned Locations",
        key: "assigned_locations",
        width: "25%",
        render: (_, record) => (
          <div className="py-2">
            {record.assigned_locations &&
            record.assigned_locations.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {record.assigned_locations
                  .slice(0, 2)
                  .map((location: string, index: number) => (
                    <Tag
                      key={index}
                      color="blue"
                      className="text-xs font-medium"
                      style={{ border: "none", margin: 0 }}
                    >
                      {location.length > 20
                        ? `${location.substring(0, 20)}...`
                        : location}
                    </Tag>
                  ))}
                {record.assigned_locations.length > 2 && (
                  <Tooltip
                    title={record.assigned_locations.slice(2).join(", ")}
                  >
                    <Tag
                      color="default"
                      className="text-xs font-medium"
                      style={{ border: "none", margin: 0 }}
                    >
                      +{record.assigned_locations.length - 2} more
                    </Tag>
                  </Tooltip>
                )}
              </div>
            ) : (
              <Text type="secondary" className="text-sm">
                No locations assigned
              </Text>
            )}
          </div>
        ),
      },
      {
        title: "Contact",
        key: "contact",
        width: "25%",
        render: (_, record) => (
          <div className="py-2 space-y-1">
            {record.contact?.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <PhoneOutlined className="text-blue-600 flex-shrink-0" />
                <span className="truncate">{record.contact.phone}</span>
              </div>
            )}
            {record.contact?.address && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <EnvironmentOutlined className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="truncate" title={record.contact.address}>
                  {record.contact.address.length > 50
                    ? `${record.contact.address.substring(0, 50)}...`
                    : record.contact.address}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        title: "Status",
        key: "status",
        width: "12%",
        align: "center" as const,
        filters: STATUS_OPTIONS.map((status) => ({
          text:
            status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
          value: status,
        })),
        onFilter: (value, record) => record.status === value,
        render: (_, record) => (
          <Tag
            icon={STATUS_ICON_MAP[record.status]}
            color={STATUS_COLOR_MAP[record.status]}
            className="font-medium"
            style={{
              textTransform: "capitalize",
              border: "none",
              margin: 0,
            }}
          >
            {record.status.replace("_", " ")}
          </Tag>
        ),
      },
      {
        title: "Hire Date",
        key: "hire_date",
        width: "10%",
        render: (_, record) => (
          <Tooltip
            title={`Hired ${dayjs().diff(
              dayjs(record.hire_date),
              "month"
            )} months ago`}
          >
            <div className="py-2">
              <div className="font-medium text-gray-900">
                {dayjs(record.hire_date).format("MMM D, YYYY")}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {dayjs(record.hire_date).fromNow()}
              </div>
            </div>
          </Tooltip>
        ),
        sorter: (a, b) =>
          dayjs(a.hire_date).unix() - dayjs(b.hire_date).unix(),
      },
      {
        title: "Actions",
        key: "actions",
        width: "8%",
        fixed: "right",
        align: "right" as const,
        render: (_, record) => (
          <Space size="small" wrap>
            <Tooltip title="View Details" placement="top">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleView(record)}
                className="hover:!bg-blue-50 !text-blue-600"
              />
            </Tooltip>
            <Tooltip title="Edit Employee" placement="top">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  setCurrentEmployee(record);
                  setDrawerVisible(true);
                }}
                className="hover:!bg-orange-50 !text-orange-600"
              />
            </Tooltip>
            <Popconfirm
              title="Delete Employee"
              description="This action cannot be undone. Are you sure?"
              onConfirm={() => handleDelete(record.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{
                danger: true,
              }}
            >
              <Tooltip title="Delete Employee" placement="top">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  className="hover:!bg-red-50 !text-red-600"
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [handleDelete, handleView]
  );

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleAddEmployee = useCallback(() => {
    setCurrentEmployee(null);
    setDrawerVisible(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerVisible(false);
    setCurrentEmployee(null);
  }, []);

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
      <div className="min-h-screen">
        <Card
          className="main-content-card"
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Filters Header */}
          <div className="mb-6">
        

            <Flex gap={12} wrap="wrap" align="center">
              <Input
                placeholder="Search by name, email, or position..."
                prefix={<SearchOutlined />}
                className="flex-1 min-w-[250px]"
                style={{
                  fontSize: "14px",
                  borderRadius: 8,
                }}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
              />
              <Select
                placeholder="Status"
                className="min-w-[140px]"
                onChange={setStatusFilter}
                allowClear
                value={statusFilter === "all" ? undefined : statusFilter}
              >
                <Option value="all">All Statuses</Option>
                {STATUS_OPTIONS.map((status) => (
                  <Option key={status} value={status}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1).replace("_", " ")}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Position"
                className="min-w-[160px]"
                onChange={setDepartmentFilter}
                allowClear
                value={
                  departmentFilter === "all" ? undefined : departmentFilter
                }
              >
                <Option value="all">All Positions</Option>
                {POSITIONS.map((position) => (
                  <Option key={position} value={position}>
                    {position}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Location"
                className="min-w-[160px]"
                onChange={setLocationFilter}
                allowClear
                value={locationFilter === "all" ? undefined : locationFilter}
                showSearch
                filterOption={(input, option) =>
                  option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase()) ?? false
                }
              >
                <Option value="all">All Locations</Option>
                {locations.map((location) => (
                  <Option key={location.id} value={location.business_name}>
                    {location.business_name}
                  </Option>
                ))}
              </Select>

                  <div className="">
                <Text type="secondary" className="text-sm">
                  Showing {filteredEmployees.length} of {employees.length}
                </Text>
            </div>
              {/* <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddEmployee}
                style={{
                  backgroundColor: "#0F6973",
                  borderColor: "#0F6973",
                  borderRadius: 6,
                }}
              >
                Add Employee
              </Button> */}
            </Flex>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="id"
            loading={loading}
            pagination={PAGINATION_CONFIG}
            scroll={{ x: 1200 }}
            bordered={false}
            size="middle"
            className="employee-table"
            locale={{
              emptyText: (
                <div className="py-12 text-center">
                  <UserOutlined className="text-6xl text-gray-300 mb-4" />
                  <Text
                    type="secondary"
                    className="block text-lg mb-4"
                    style={{ color: "#6b7280" }}
                  >
                    {employees.length === 0
                      ? "No employees in the system yet"
                      : "No matching employees found"}
                  </Text>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddEmployee}
                    style={{
                      backgroundColor: "#0F6973",
                      borderColor: "#0F6973",
                      borderRadius: 6,
                    }}
                  >
                    Add Employee
                  </Button>
                </div>
              ),
            }}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "table-row-even" : "table-row-odd"
            }
          />
        </Card>

        {/* EmployeeViewModal */}
        <EmployeeViewModal
          employee={viewingEmployee}
          visible={viewModalVisible}
          onClose={() => setViewModalVisible(false)}
        />

        {/* Form Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-3" style={{ fontSize: "18px" }}>
              <UserOutlined />
              {currentEmployee ? "Edit Employee" : "Add Employee"}
            </div>
          }
          width={720}
          open={drawerVisible}
          onClose={handleDrawerClose}
          styles={{
            body: { padding: "24px 0" },
            header: { borderBottom: "1px solid #e5e7eb" },
          }}
          destroyOnClose
        >
          <EmployeeForm
            initialValues={currentEmployee || undefined}
            onSubmit={currentEmployee ? handleUpdate : handleCreate}
            loading={formLoading}
            locations={locations}
          />
        </Drawer>

        {/* Floating Action Button */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddEmployee}
          className="floating-add-btn"
          style={{
            backgroundColor: "#0F6973",
            borderColor: "#0F6973",
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(15, 105, 115, 0.4)",
            zIndex: 1000,
          }}
          size="large"
        />
      </div>

      <style>{`
        .employee-table .ant-table-thead > tr > th {
          background: #f8fafc;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
          padding: 12px 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .employee-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
          padding: 12px 16px;
          font-size: 14px;
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
          font-size: 14px;
          margin: 24px 0 0 0;
          padding: 16px 0 0 0;
          border-top: 1px solid #e5e7eb;
        }

        .ant-btn {
          font-size: 14px;
          border-radius: 6px;
        }

        .ant-tag {
          font-size: 12px;
          border-radius: 6px;
        }

        .ant-input,
        .ant-select-item,
        .ant-select-selector {
          font-size: 14px;
          border-radius: 6px;
        }

        .floating-add-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .floating-add-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(15, 105, 115, 0.5) !important;
        }

        .main-content-card {
          transition: box-shadow 0.2s ease;
        }

        .main-content-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
        }

        .ant-card .ant-card-body {
          padding: 24px;
        }

        .ant-select-dropdown {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .ant-tooltip {
          font-size: 13px;
        }
      `}</style>
    </>
  );
};

export default EmployeePage;