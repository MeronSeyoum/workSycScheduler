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
  Skeleton,
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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/service/api";
import { useDebounce } from "use-debounce";
import { User } from "@/types/user";
import UserForm from "../../components/form/UserForm";

const { Option } = Select;
const { Text } = Typography;

const roleOptions = ["admin", "manager", "employee"];
const statusOptions = ["active", "inactive", "suspended"];

const roleColorMap: Record<string, string> = {
  admin: "purple",
  manager: "blue",
  employee: "cyan",
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
      type: "success" | "error" | "info",
      message: string,
      description?: string
    ) => {
      const icons = {
        success: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
        error: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
        info: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
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
  const { token } = useAuth();
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

  const filteredUsers = useMemo(() => {
    let result = [...users];
    const term = debouncedSearchTerm.toLowerCase();

    if (debouncedSearchTerm) {
      result = result.filter(
        (user) =>
          user.first_name.toLowerCase().includes(term) ||
          user.last_name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
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
        style: { zIndex: 999 },
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

  const columns: ColumnsType<User> = [
    {
      title: "USER",
      key: "user",
      width: 250,
      fixed: "left",
      render: (_, record) => (
        <Flex align="center" gap={12}>
          <Badge dot color={statusColorMap[record.status]} offset={[-5, 40]}>
            <Avatar
              className="bg-gradient-to-br from-teal-400 to-teal-600"
              size="default"
            >
              {record.first_name 
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Avatar>
          </Badge>
          <div>
            <Text
              strong
              style={{ display: "block", fontSize: 15, color: "#0F6973" }}
            >
              {record.first_name} {record.last_name}
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {record.role}
            </Text>
          </div>
        </Flex>
      ),
      sorter: (a, b) => a.first_name.localeCompare(b.first_name),
    },
    {
      title: "CONTACT",
      key: "contact",
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 6 }}>
            <MailOutlined style={{ color: "#0F6973", marginRight: 8 }} />
            <Text style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "LAST LOGIN",
      key: "last_login",
      width: 180,
      render: (_, record) => (
        <Text style={{ fontSize: 12 }}>
          {record.is_login
            ? new Date(record.updated_at).toLocaleString()
            : "Never"}
        </Text>
      ),
      sorter: (a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    },
    {
      title: "ROLE",
      key: "role",
      width: 120,
      filters: roleOptions.map((role) => ({
        text: role.charAt(0).toUpperCase() + role.slice(1),
        value: role,
      })),
      onFilter: (value, record) => record.role === value,
      render: (_, record) => (
        <Tag
          color={roleColorMap[record.role]}
          style={{
            padding: "4px 8px",
            borderRadius: 12,
            textTransform: "uppercase",
            fontWeight: 500,
            width: 80,
            textAlign: "center",
          }}
        >
          {record.role}
        </Tag>
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
      title: "ACTIONS",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit user">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Reset password">
            <Button
              shape="circle"
              icon={<LockOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleResetPassword(record.id);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete user">
            <Button
              shape="circle"
              icon={<DeleteOutlined />}
              danger
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record.id);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="m-4 rounded-lg pt-4">
        <div>
          <div style={{ marginBottom: 24 }} className="flex justify-between">
            <Flex gap={16} wrap="wrap">
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined />}
                style={{ width: 280 }}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
              <Select
                placeholder="Filter by role"
                style={{ width: 150 }}
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
                style={{ width: 150 }}
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
            </Flex>
            <div className="flex justify-end gap-4">
              {selectedRowKeys.length > 0 && (
                <Button icon={<ExportOutlined />} onClick={handleBulkExport}>
                  Export Selected
                </Button>
              )}
              <Button
                style={{ backgroundColor: "#0F6973", color: "white" }}
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedUser(null);
                  setDrawerVisible(true);
                }}
              >
                Add User
              </Button>
            </div>
          </div>

          {loading && users.length === 0 ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
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
              scroll={{ x: 1100, y: "calc(100vh - 350px)" }}
              style={{
                marginTop: 16,
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
              }}
              bordered
              size="middle"
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
              onRow={(record) => ({
                onClick: () => {
                  setSelectedUser(record);
                },
              })}
              className="sharp-table"
              rowClassName={() => "sharp-table-row"}
              components={{
                header: {
                  cell: (props) => (
                    <th
                      {...props}
                      style={{
                        ...props.style,
                        backgroundColor: "#fafafa",
                        borderBottom: "1px solid #d9d9d9",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "13px",
                        padding: "12px 16px",
                      }}
                    />
                  ),
                },
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "40px 0", textAlign: "center" }}>
                    <UserOutlined
                      style={{
                        fontSize: 48,
                        color: "#bfbfbf",
                        marginBottom: 16,
                      }}
                    />
                    <Text
                      type="secondary"
                      style={{ display: "block", fontSize: 16 }}
                    >
                      {users.length === 0
                        ? "No users in the system yet"
                        : "No matching users found"}
                    </Text>
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setSelectedUser(null);
                        setDrawerVisible(true);
                      }}
                      style={{
                        marginTop: 16,
                        backgroundColor: "#0F6973",
                        color: "white",
                      }}
                    >
                      Add User
                    </Button>
                  </div>
                ),
              }}
            />
          )}
        </div>
        <Drawer
          title={selectedUser ? "Edit User" : "Add User"}
          width={720}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
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
