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
  Switch,
  Dropdown,
  MenuProps,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ExportOutlined,
  MoreOutlined,
  MobileOutlined,
  DesktopOutlined,
  ReloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import { useDebounce } from "use-debounce";
import { User } from "@/lib/types/user";
import UserForm from "@/components/form/UserForm";

const { Option } = Select;
const { Text, Title } = Typography;

const roleOptions = ["admin", "manager", "employee", "mobile_user"];
const statusOptions = ["active", "inactive", "suspended"];

const roleColorMap: Record<string, string> = {
  admin: "purple",
  manager: "blue",
  employee: "cyan",
  mobile_user: "green",
};

const statusColorMap: Record<string, string> = {
  active: "green",
  inactive: "orange",
  suspended: "red",
};

const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = useCallback(
    (
      type: "success" | "error" | "info" | "warning",
      message: string,
      description?: string
    ) => {
      const icons = {
        success: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        error: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        info: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
        warning: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      };

      api[type]({
        message,
        description,
        icon: icons[type],
        placement: "topRight",
        duration: type === "error" ? 4 : 3,
      });
    },
    [api]
  );

  return { showNotification, contextHolder };
};

const UserManagementPage: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const { showNotification, contextHolder } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [passwordVisibility, setPasswordVisibility] = useState<Record<number, boolean>>({});

  const filteredUsers = useMemo(() => {
    let result = [...users];
    const term = debouncedSearchTerm.toLowerCase();

    if (debouncedSearchTerm) {
      result = result.filter(
        (user) =>
          user.first_name?.toLowerCase().includes(term) ||
          user.last_name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.phone?.toLowerCase().includes(term)
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter);
    }

    return result;
  }, [users, debouncedSearchTerm, roleFilter, statusFilter]);

  const fetchUsers = useCallback(async () => {
    if (!token) {
      showNotification(
        "error",
        "Authentication Required",
        "Please login to access user data"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.user.fetchUsers(token);
      const userData: User[] = Array.isArray(response)
        ? response
        : response || [];
      setUsers(userData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load users";
      showNotification("error", "Loading Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSubmit = useCallback(
    async (values: any) => {
      setFormLoading(true);
      try {
        if (values.id) {
          // Update existing user
          const updatedUser = await api.user.updateUser(
            values.id,
            values,
            token!
          );
          setUsers(
            users.map((user) => (user.id === values.id ? updatedUser : user))
          );
          showNotification(
            "success",
            "User Updated",
            `${values.first_name} ${values.last_name} updated successfully`
          );
        } else {
          // Create new user
          const newUser = await api.user.createUser(values, token!);
          setUsers([...users, newUser]);
          showNotification(
            "success",
            "User Created",
            `${values.first_name} ${values.last_name} added successfully`
          );
        }
        setDrawerVisible(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Operation failed";
        showNotification(
          "error",
          "id" in values ? "Update Failed" : "Creation Failed",
          errorMessage
        );
      } finally {
        setFormLoading(false);
      }
    },
    [users, token, showNotification]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      const user = users.find((u) => u.id === id);
      if (!user) return;

      Modal.confirm({
        title: "Confirm Delete",
        icon: <ExclamationCircleOutlined />,
        content: `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await api.user.deleteUser(id, token!);
            setUsers(users.filter((u) => u.id !== id));
            showNotification(
              "success",
              "User Deleted",
              `${user.first_name} ${user.last_name} was removed`
            );
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to delete user";
            showNotification("error", "Deletion Failed", errorMessage);
          }
        },
      });
    },
    [users, token, showNotification]
  );

  const handleResetPassword = useCallback(
    async (id: number) => {
      const user = users.find((u) => u.id === id);
      if (!user) return;

      Modal.confirm({
        title: "Reset Password",
        icon: <LockOutlined />,
        content: `Send password reset instructions to ${user.email}?`,
        okText: "Send Reset Link",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await api.user.resetUserPassword(id, token!);
            showNotification(
              "success",
              "Reset Email Sent",
              `Password reset instructions sent to ${user.email}`
            );
          } catch (error) {
            showNotification(
              "error",
              "Reset Failed",
              error instanceof Error
                ? error.message
                : "Failed to reset password"
            );
          }
        },
      });
    },
    [users, token, showNotification]
  );

  const handleStatusChange = useCallback(
    async (id: number, newStatus: string) => {
      try {
        const user = users.find((u) => u.id === id);
        if (!user) return;

        const updatedUser = await api.user.updateUser(
          id,
          { ...user, status: newStatus },
          token!
        );
        
        setUsers(users.map((u) => (u.id === id ? updatedUser : u)));
        showNotification(
          "success",
          "Status Updated",
          `${user.first_name}'s status changed to ${newStatus}`
        );
      } catch (error) {
        showNotification(
          "error",
          "Update Failed",
          error instanceof Error ? error.message : "Failed to update status"
        );
      }
    },
    [users, token, showNotification]
  );

  const handleBulkExport = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      showNotification(
        "info",
        "No Users Selected",
        "Please select users to export"
      );
      return;
    }
    showNotification(
      "success",
      "Export Started",
      `Preparing ${selectedRowKeys.length} users for export`
    );
  }, [selectedRowKeys, showNotification]);

  const togglePasswordVisibility = useCallback((userId: number) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "mobile_user":
        return <MobileOutlined className="text-green-500" />;
      case "admin":
        return <DesktopOutlined className="text-purple-500" />;
      case "manager":
        return <DesktopOutlined className="text-blue-500" />;
      default:
        return <UserOutlined className="text-cyan-500" />;
    }
  };

  const getActionMenuItems = (record: User): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Edit User',
      icon: <EditOutlined />,
      onClick: () => {
        setSelectedUser(record);
        setDrawerVisible(true);
      }
    },
    {
      key: 'reset-password',
      label: 'Reset Password',
      icon: <LockOutlined />,
      onClick: () => handleResetPassword(record.id)
    },
    {
      key: 'view-details',
      label: 'View Details',
      icon: <EyeOutlined />,
      onClick: () => {
        // Implement view details functionality
        showNotification('info', 'User Details', `Viewing details for ${record.first_name} ${record.last_name}`);
      }
    },
    record.id !== currentUser?.id && {
      key: 'delete',
      label: 'Delete User',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record.id)
    }
  ].filter(Boolean) as MenuProps['items'];

  const columns: ColumnsType<User> = [
    {
      title: "USER",
      key: "user",
      width: 250,
      fixed: "left",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Badge dot color={statusColorMap[record.status]} offset={[-5, 40]}>
            <Avatar
              className="bg-gradient-to-br from-teal-400 to-teal-600"
              size="default"
              icon={<UserOutlined />}
              src={record.profile_image}
            >
              {record.first_name?.[0]}{record.last_name?.[0]}
            </Avatar>
          </Badge>
          <div>
            <div className="text-sm font-semibold text-teal-800">
              {record.first_name} {record.last_name}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              {getRoleIcon(record.role)}
              <span>{record.role}</span>
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.first_name.localeCompare(b.first_name),
    },
    {
      title: "CONTACT INFO",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <MailOutlined className="text-teal-600" />
            <span className="text-gray-700">{record.email}</span>
          </div>
          {record.phone && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">📱</span>
              <span className="text-gray-700">{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "LAST LOGIN",
      key: "last_login",
      width: 150,
      render: (_, record) => (
        <div className="text-xs text-gray-600">
          {record.last_login 
            ? new Date(record.last_login).toLocaleDateString()
            : "Never logged in"}
        </div>
      ),
      sorter: (a, b) => new Date(a.last_login || 0).getTime() - new Date(b.last_login || 0).getTime(),
    },
    {
      title: "STATUS",
      key: "status",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Switch
            size="small"
            checked={record.status === "active"}
            onChange={(checked) => 
              handleStatusChange(record.id, checked ? "active" : "inactive")
            }
            disabled={record.id === currentUser?.id}
          />
          <Tag
            color={statusColorMap[record.status]}
            className="px-2 py-1 rounded-full text-xs font-medium capitalize"
          >
            {record.status}
          </Tag>
        </div>
      ),
    },
    {
      title: "PASSWORD",
      key: "password",
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">
            {passwordVisibility[record.id] ? record.password : '••••••••'}
          </span>
          <Button
            type="text"
            size="small"
            icon={passwordVisibility[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => togglePasswordVisibility(record.id)}
          />
        </div>
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip title="Reset password">
            <Button
              size="small"
              icon={<LockOutlined />}
              onClick={() => handleResetPassword(record.id)}
            />
          </Tooltip>
          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="p-6 bg-gray-50 min-h-screen">
        <Card className="rounded-xl shadow-sm border-0">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Title level={2} className="text-teal-800 m-0">User Management</Title>
                <Text type="secondary" className="text-gray-500">
                  Manage employees and mobile app users
                </Text>
              </div>
              <Button
                type="primary"
                className="bg-teal-700 border-teal-700 hover:bg-teal-600 rounded-lg font-medium"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedUser(null);
                  setDrawerVisible(true);
                }}
              >
                Add User
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
              <Input
                placeholder="Search users by name, email, or phone..."
                prefix={<SearchOutlined />}
                className="w-80 rounded-lg"
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
              <Select
                placeholder="Filter by role"
                className="w-40 rounded-lg"
                onChange={(value: string) => setRoleFilter(value)}
                allowClear
                value={roleFilter}
              >
                <Option value="all">All Roles</Option>
                {roleOptions.map((role) => (
                  <Option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by status"
                className="w-40 rounded-lg"
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
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchUsers}
                className="rounded-lg"
              >
                Refresh
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) => `Total ${total} users`,
            }}
            scroll={{ x: 1000 }}
            className="border-0"
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
            locale={{
              emptyText: (
                <div className="text-center py-12">
                  <UserOutlined className="text-4xl text-gray-300 mb-4" />
                  <div className="text-gray-500 text-lg mb-4">
                    {users.length === 0
                      ? "No users in the system yet"
                      : "No matching users found"}
                  </div>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setSelectedUser(null);
                      setDrawerVisible(true);
                    }}
                  >
                    Add First User
                  </Button>
                </div>
              ),
            }}
          />
        </Card>

        <Drawer
          title={selectedUser ? "Edit User" : "Add User"}
          width={720}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          destroyOnClose
          styles={{
            body: { padding: "24px 0" },
          }}
        >
          <UserForm
            initialValues={selectedUser || undefined}
            onSubmit={handleSubmit}
            loading={formLoading}
          />
        </Drawer>
      </div>
    </>
  );
};

export default UserManagementPage;