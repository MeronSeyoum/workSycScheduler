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
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import { useDebounce } from "use-debounce";
import { User } from "@/lib/types/user";
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



// "use client";
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   Search,
//   Plus,
//   Filter,
//   Download,
//   Upload,
//   MoreHorizontal,
//   Edit3,
//   Trash2,
//   Lock,
//   Mail,
//   Phone,
//   MapPin,
//   Calendar,
//   User,
//   Users,
//   Shield,
//   Activity,
//   Eye,
//   EyeOff,
//   RefreshCw,
//   Settings,
//   ChevronDown,
//   Star,
//   MessageCircle,
//   Bell,
//   Zap,
//   Award,
//   TrendingUp,
//   UserCheck,
//   UserX,
//   Clock,
//   Database,
//   FileText,
//   X
// } from "lucide-react";
// import { useAuth } from "@/components/providers/AuthProvider";
// import { api } from "@/lib/api";
// import { useDebounce } from "use-debounce";
// import { User as UserType } from "@/lib/types/user";
// import UserForm from "../../components/form/UserForm";

// const roleColors = {
//   admin: "bg-purple-100 text-purple-800 border-purple-200",
//   manager: "bg-blue-100 text-blue-800 border-blue-200",
//   employee: "bg-green-100 text-green-800 border-green-200"
// };

// const statusColors = {
//   active: "bg-emerald-100 text-emerald-800 border-emerald-200",
//   inactive: "bg-amber-100 text-amber-800 border-amber-200",
//   suspended: "bg-red-100 text-red-800 border-red-200"
// };

// const UserCard = ({ user, onEdit, onDelete, onToggleStatus, onResetPassword, isSelected, onSelect }) => {
//   const [showDetails, setShowDetails] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getTimeAgo = (dateString) => {
//     const now = new Date();
//     const date = new Date(dateString);
//     const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
//     if (diffInHours < 1) return 'Just now';
//     if (diffInHours < 24) return `${diffInHours}h ago`;
//     const diffInDays = Math.floor(diffInHours / 24);
//     if (diffInDays < 7) return `${diffInDays}d ago`;
//     return formatDate(dateString);
//   };

//   return (
//     <div
//       className={`bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer ${
//         isSelected 
//           ? 'border-blue-400 shadow-lg shadow-blue-100' 
//           : isHovered 
//             ? 'border-gray-300 shadow-md' 
//             : 'border-gray-200'
//       } ${user.status === 'suspended' ? 'opacity-75' : ''}`}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={() => onSelect(user.id)}
//     >
//       {/* Header */}
//       <div className="p-6">
//         <div className="flex items-start justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-lg ring-2 ring-white shadow-lg">
//                 {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
//               </div>
//               <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
//                 user.status === 'active' ? 'bg-green-500' :
//                 user.status === 'inactive' ? 'bg-amber-500' : 'bg-red-500'
//               }`} />
//               <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
//                 <UserCheck size={12} className="text-white" />
//               </div>
//             </div>
            
//             <div className="flex-1">
//               <div className="flex items-center space-x-2">
//                 <h3 className="text-lg font-semibold text-gray-900">
//                   {user.first_name} {user.last_name}
//                 </h3>
//                 <Shield size={16} className="text-green-600" />
//                 <div className="flex items-center space-x-1">
//                   {Array.from({ length: 5 }).map((_, i) => (
//                     <Star 
//                       key={i} 
//                       size={14} 
//                       className={`${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
//                     />
//                   ))}
//                   <span className="text-sm text-gray-600 ml-1">4.5</span>
//                 </div>
//               </div>
              
//               <div className="flex items-center space-x-3 mt-2">
//                 <span className={`px-3 py-1 text-xs font-medium rounded-full border ${roleColors[user.role]}`}>
//                   {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
//                 </span>
//                 <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusColors[user.status]}`}>
//                   {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center space-x-2">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowDetails(!showDetails);
//               }}
//               className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               {showDetails ? <EyeOff size={18} /> : <Eye size={18} />}
//             </button>
            
//             <div className="relative group">
//               <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
//                 <MoreHorizontal size={18} />
//               </button>
              
//               <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
//                 <div className="py-2">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onEdit(user);
//                     }}
//                     className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                   >
//                     <Edit3 size={16} />
//                     <span>Edit User</span>
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onResetPassword(user.id);
//                     }}
//                     className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                   >
//                     <Lock size={16} />
//                     <span>Reset Password</span>
//                   </button>
//                   <hr className="my-2" />
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onDelete(user.id);
//                     }}
//                     className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                   >
//                     <Trash2 size={16} />
//                     <span>Delete User</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Quick Info */}
//         <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-1">
//               <Mail size={14} />
//               <span className="truncate max-w-48">{user.email}</span>
//             </div>
//             <div className="flex items-center space-x-1">
//               <Calendar size={14} />
//               <span>{new Date(user.created_at).toLocaleDateString()}</span>
//             </div>
//           </div>
//           <div className="flex items-center space-x-1">
//             <Clock size={14} />
//             <span>Last seen {getTimeAgo(user.updated_at)}</span>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="mt-4 grid grid-cols-3 gap-4">
//           <div className="text-center p-3 bg-gray-50 rounded-lg">
//             <div className="text-lg font-semibold text-gray-900">{user.is_login ? '✓' : '✗'}</div>
//             <div className="text-xs text-gray-600">Login Status</div>
//           </div>
//           <div className="text-center p-3 bg-blue-50 rounded-lg">
//             <div className="text-lg font-semibold text-blue-900">{user.role}</div>
//             <div className="text-xs text-blue-600">Role</div>
//           </div>
//           <div className="text-center p-3 bg-green-50 rounded-lg">
//             <div className="text-lg font-semibold text-green-900">{user.status}</div>
//             <div className="text-xs text-green-600">Status</div>
//           </div>
//         </div>
//       </div>

//       {/* Expandable Details */}
//       {showDetails && (
//         <div className="px-6 pb-6 border-t bg-gray-50">
//           <div className="pt-4 space-y-4">
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <div className="text-gray-600">Created</div>
//                 <div className="font-medium">{formatDate(user.created_at)}</div>
//               </div>
//               <div>
//                 <div className="text-gray-600">Updated</div>
//                 <div className="font-medium">{formatDate(user.updated_at)}</div>
//               </div>
//               <div>
//                 <div className="text-gray-600">Email</div>
//                 <div className="font-medium">{user.email}</div>
//               </div>
//               <div>
//                 <div className="text-gray-600">Login Status</div>
//                 <div className={`font-medium ${user.is_login ? 'text-green-600' : 'text-red-600'}`}>
//                   {user.is_login ? 'Logged In' : 'Not Logged In'}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const useNotification = () => {
//   const showNotification = useCallback((type, message, description) => {
//     // Simple notification - you can enhance this with a proper toast library
//     if (type === 'success') {
//       alert(`✅ ${message}: ${description || ''}`);
//     } else if (type === 'error') {
//       alert(`❌ ${message}: ${description || ''}`);
//     } else {
//       alert(`ℹ️ ${message}: ${description || ''}`);
//     }
//   }, []);

//   return { showNotification };
// };

// const AdvancedUserManagement = () => {
//   const { token } = useAuth();
//   const { showNotification } = useNotification();
  
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [formLoading, setFormLoading] = useState(false);
//   const [selectedUsers, setSelectedUsers] = useState(new Set());
//   const [searchTerm, setSearchTerm] = useState("");
//   const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
//   const [roleFilter, setRoleFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [viewMode, setViewMode] = useState("table"); // Default to table
//   const [sortBy, setSortBy] = useState("name");
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [showFilters, setShowFilters] = useState(false);
//   const [drawerVisible, setDrawerVisible] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [selectedRowKeys, setSelectedRowKeys] = useState([]);

//   // Filter and sort users
//   const filteredUsers = useMemo(() => {
//     let result = [...users];
//     const term = debouncedSearchTerm.toLowerCase();

//     if (debouncedSearchTerm) {
//       result = result.filter(
//         (user) =>
//           user.first_name.toLowerCase().includes(term) ||
//           user.last_name.toLowerCase().includes(term) ||
//           user.email.toLowerCase().includes(term)
//       );
//     }

//     if (roleFilter !== "all") {
//       result = result.filter((user) => user.role === roleFilter);
//     }

//     if (statusFilter !== "all") {
//       result = result.filter((user) => user.status === statusFilter);
//     }

//     // Sort users
//     result.sort((a, b) => {
//       let aValue, bValue;
      
//       switch (sortBy) {
//         case "name":
//           aValue = `${a.first_name} ${a.last_name}`;
//           bValue = `${b.first_name} ${b.last_name}`;
//           break;
//         case "email":
//           aValue = a.email;
//           bValue = b.email;
//           break;
//         case "role":
//           aValue = a.role;
//           bValue = b.role;
//           break;
//         case "status":
//           aValue = a.status;
//           bValue = b.status;
//           break;
//         case "created_at":
//           aValue = new Date(a.created_at);
//           bValue = new Date(b.created_at);
//           break;
//         case "updated_at":
//           aValue = new Date(a.updated_at);
//           bValue = new Date(b.updated_at);
//           break;
//         default:
//           aValue = a.first_name;
//           bValue = b.first_name;
//       }

//       if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
//       if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
//       return 0;
//     });

//     return result;
//   }, [users, debouncedSearchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

//   const fetchUsers = useCallback(async () => {
//     if (!token) {
//       showNotification(
//         "error",
//         "Authentication Required",
//         "Please login to access user data"
//       );
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await api.user.fetchUsers(token);
//       const userData = Array.isArray(response) ? response : response || [];
//       setUsers(userData);
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : "Failed to load users";
//       showNotification("error", "Loading Failed", errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }, [token, showNotification]);

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   const handleSubmit = useCallback(
//     async (values) => {
//       setFormLoading(true);
//       try {
//         if (values.id) {
//           // Update existing user
//           const updatedUser = await api.user.updateUser(
//             values.id,
//             values,
//             token
//           );
//           setUsers(
//             users.map((user) => (user.id === values.id ? updatedUser : user))
//           );
//           showNotification(
//             "success",
//             "User Updated",
//             `${values.first_name} ${values.last_name} updated successfully`
//           );
//         } else {
//           // Create new user
//           const newUser = await api.user.createUser(values, token);
//           setUsers([...users, newUser]);
//           showNotification(
//             "success",
//             "User Created",
//             `${values.first_name} ${values.last_name} added successfully`
//           );
//         }
//         setDrawerVisible(false);
//         setSelectedUser(null);
//       } catch (error) {
//         const errorMessage =
//           error instanceof Error ? error.message : "Operation failed";
//         showNotification(
//           "error",
//           values.id ? "Update Failed" : "Creation Failed",
//           errorMessage
//         );
//       } finally {
//         setFormLoading(false);
//       }
//     },
//     [users, token, showNotification]
//   );

//   const handleDelete = useCallback(
//     async (id) => {
//       const user = users.find((u) => u.id === id);
//       if (!user) return;

//       if (window.confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`)) {
//         try {
//           await api.user.deleteUser(id, token);
//           setUsers(users.filter((u) => u.id !== id));
//           setSelectedUsers(new Set([...selectedUsers].filter(userId => userId !== id)));
//           showNotification(
//             "success",
//             "User Deleted",
//             `${user.first_name} ${user.last_name} was removed`
//           );
//         } catch (error) {
//           const errorMessage =
//             error instanceof Error ? error.message : "Failed to delete user";
//           showNotification("error", "Deletion Failed", errorMessage);
//         }
//       }
//     },
//     [users, token, showNotification, selectedUsers]
//   );

//   const handleResetPassword = useCallback(
//     async (id) => {
//       const user = users.find((u) => u.id === id);
//       if (!user) return;

//       if (window.confirm(`Send password reset instructions to ${user.email}?`)) {
//         try {
//           await api.user.resetUserPassword(id, token);
//           showNotification(
//             "success",
//             "Reset Email Sent",
//             `Password reset instructions sent to ${user.email}`
//           );
//         } catch (error) {
//           showNotification(
//             "error",
//             "Reset Failed",
//             error instanceof Error ? error.message : "Failed to reset password"
//           );
//         }
//       }
//     },
//     [users, token, showNotification]
//   );

//   const handleSelectUser = (userId) => {
//     const newSelected = new Set(selectedUsers);
//     if (newSelected.has(userId)) {
//       newSelected.delete(userId);
//     } else {
//       newSelected.add(userId);
//     }
//     setSelectedUsers(newSelected);
//     setSelectedRowKeys(Array.from(newSelected));
//   };

//   const handleSelectAll = () => {
//     if (selectedUsers.size === filteredUsers.length) {
//       setSelectedUsers(new Set());
//       setSelectedRowKeys([]);
//     } else {
//       const allIds = new Set(filteredUsers.map(user => user.id));
//       setSelectedUsers(allIds);
//       setSelectedRowKeys(Array.from(allIds));
//     }
//   };

//   const handleBulkAction = (action) => {
//     const selectedUsersList = users.filter(user => selectedUsers.has(user.id));
    
//     switch (action) {
//       case 'export':
//         showNotification(
//           "success",
//           "Export Started",
//           `Preparing ${selectedUsers.size} users for export`
//         );
//         console.log('Exporting users:', selectedUsersList);
//         break;
//       case 'delete':
//         if (window.confirm(`Delete ${selectedUsers.size} selected users?`)) {
//           // Handle bulk delete - you'd need to implement this in your API
//           showNotification("info", "Bulk Delete", "Feature not yet implemented");
//         }
//         break;
//     }
//   };

//   const stats = {
//     total: users.length,
//     active: users.filter(u => u.status === 'active').length,
//     inactive: users.filter(u => u.status === 'inactive').length,
//     suspended: users.filter(u => u.status === 'suspended').length,
//     admins: users.filter(u => u.role === 'admin').length,
//     managers: users.filter(u => u.role === 'manager').length,
//     employees: users.filter(u => u.role === 'employee').length
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
//               <p className="text-gray-600">Manage and organize your team members efficiently</p>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors">
//                 <Upload size={20} />
//                 <span>Import</span>
//               </button>
              
//               <button 
//                 onClick={() => handleBulkAction('export')}
//                 className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
//               >
//                 <Download size={20} />
//                 <span>Export</span>
//               </button>
              
//               <button
//                 onClick={() => {
//                   setSelectedUser(null);
//                   setDrawerVisible(true);
//                 }}
//                 className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
//               >
//                 <Plus size={20} />
//                 <span>Add User</span>
//               </button>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
//             <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <Users size={20} className="text-blue-600" />
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
//                   <div className="text-sm text-gray-600">Total Users</div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <Activity size={20} className="text-green-600" />
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-green-900">{stats.active}</div>
//                   <div className="text-sm text-gray-600">Active</div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-amber-100 rounded-lg">
//                   <Clock size={20} className="text-amber-600" />
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-amber-900">{stats.inactive}</div>
//                   <div className="text-sm text-gray-600">Inactive</div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-red-100 rounded-lg">
//                   <UserX size={20} className="text-red-600" />
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-red-900">{stats.suspended}</div>
//                   <div className="text-sm text-gray-600">Suspended</div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-purple-100 rounded-lg">
//                   <Shield size={20} className="text-purple-600" />
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-purple-900">{stats.admins}</div>
//                   <div className="text-sm text-gray-600">Admins</div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <Award size={20} className="text-blue-600" />
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-blue-900">{stats.managers}</div>
//                   <div className="text-sm text-gray-600">Managers</div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
//               <div className="flex items-center space-x-3">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <User size={20} className="text-green-600" />
//                 </div>
//                 <div>
//                   <div className="text-2xl font-bold text-green-900">{stats.employees}</div>
//                   <div className="text-sm text-gray-600">Employees</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
//             <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
//               <div className="relative flex-1 max-w-md">
//                 <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search users by name or email..."
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
              
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
//                   showFilters || roleFilter !== 'all' || statusFilter !== 'all'
//                     ? 'bg-blue-50 border-blue-200 text-blue-700'
//                     : 'border-gray-300 text-gray-700 hover:bg-gray-50'
//                 }`}
//               >
//                 <Filter size={20} />
//                 <span>Filters</span>
//                 <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
//               </button>
//             </div>

//             <div className="flex items-center space-x-4">
//               <select
//                 className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//               >
//                 <option value="name">Sort by Name</option>
//                 <option value="email">Sort by Email</option>
//                 <option value="role">Sort by Role</option>
//                 <option value="status">Sort by Status</option>
//                 <option value="created_at">Sort by Created Date</option>
//                 <option value="updated_at">Sort by Updated Date</option>
//               </select>

//               <button
//                 onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
//                 className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
//               >
//                 <TrendingUp size={20} className={`transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
//               </button>

//               <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
//                 <button
//                   onClick={() => setViewMode('table')}
//                   className={`p-3 ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
//                 >
//                   <div className="w-4 h-4 flex flex-col gap-1">
//                     <div className="h-0.5 bg-current rounded"></div>
//                     <div className="h-0.5 bg-current rounded"></div>
//                     <div className="h-0.5 bg-current rounded"></div>
//                   </div>
//                 </button>
//                 <button
//                   onClick={() => setViewMode('grid')}
//                   className={`p-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
//                 >
//                   <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
//                     <div className="bg-current rounded-sm"></div>
//                     <div className="bg-current rounded-sm"></div>
//                     <div className="bg-current rounded-sm"></div>
//                     <div className="bg-current rounded-sm"></div>
//                   </div>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Expandable Filters */}
//           {showFilters && (
//             <div className="mt-6 pt-6 border-t border-gray-200">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
//                   <select
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     value={roleFilter}
//                     onChange={(e) => setRoleFilter(e.target.value)}
//                   >
//                     <option value="all">All Roles</option>
//                     <option value="admin">Admin</option>
//                     <option value="manager">Manager</option>
//                     <option value="employee">Employee</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//                   <select
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                   >
//                     <option value="all">All Statuses</option>
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                     <option value="suspended">Suspended</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Bulk Actions */}
//         {selectedUsers.size > 0 && (
//           <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-4">
//                 <span className="text-blue-900 font-medium">
//                   {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
//                 </span>
//                 <button
//                   onClick={() => {
//                     setSelectedUsers(new Set());
//                     setSelectedRowKeys([]);
//                   }}
//                   className="text-blue-600 hover:text-blue-800 text-sm underline"
//                 >
//                   Clear selection
//                 </button>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => handleBulkAction('export')}
//                   className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
//                 >
//                   <Download size={16} />
//                   <span>Export</span>
//                 </button>
//                 <button
//                   onClick={() => handleBulkAction('delete')}
//                   className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
//                 >
//                   <Trash2 size={16} />
//                   <span>Delete</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Results Summary */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center space-x-4">
//             <span className="text-gray-600">
//               Showing {filteredUsers.length} of {users.length} users
//             </span>
//             {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
//               <button
//                 onClick={() => {
//                   setSearchTerm('');
//                   setRoleFilter('all');
//                   setStatusFilter('all');
//                 }}
//                 className="text-blue-600 hover:text-blue-800 text-sm underline"
//               >
//                 Clear all filters
//               </button>
//             )}
//           </div>

//           <div className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
//               onChange={handleSelectAll}
//               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//             />
//             <span className="text-gray-600 text-sm">Select all visible</span>
//           </div>
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
//             <div className="animate-pulse">
//               <div className="grid grid-cols-1 gap-4">
//                 {Array.from({ length: 5 }).map((_, i) => (
//                   <div key={i} className="flex items-center space-x-4">
//                     <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
//                     <div className="flex-1 space-y-2">
//                       <div className="h-4 bg-gray-300 rounded w-1/4"></div>
//                       <div className="h-3 bg-gray-300 rounded w-1/2"></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* User Grid/Table */}
//         {!loading && (
//           <>
//             {viewMode === 'grid' ? (
//               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//                 {filteredUsers.map((user) => (
//                   <UserCard
//                     key={user.id}
//                     user={user}
//                     onEdit={(user) => {
//                       setSelectedUser(user);
//                       setDrawerVisible(true);
//                     }}
//                     onDelete={handleDelete}
//                     onResetPassword={handleResetPassword}
//                     isSelected={selectedUsers.has(user.id)}
//                     onSelect={handleSelectUser}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-50 border-b border-gray-200">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           <input
//                             type="checkbox"
//                             checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
//                             onChange={handleSelectAll}
//                             className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                           />
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login</th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
//                         <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredUsers.map((user) => (
//                         <tr key={user.id} className="hover:bg-gray-50 transition-colors">
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <input
//                               type="checkbox"
//                               checked={selectedUsers.has(user.id)}
//                               onChange={() => handleSelectUser(user.id)}
//                               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                             />
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center space-x-3">
//                               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
//                                 {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
//                               </div>
//                               <div>
//                                 <div className="text-sm font-medium text-gray-900">
//                                   {user.first_name} {user.last_name}
//                                 </div>
//                                 <div className="text-sm text-gray-500">ID: {user.id}</div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="text-sm text-gray-900">{user.email}</div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[user.role]}`}>
//                               {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[user.status]}`}>
//                               {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                               user.is_login 
//                                 ? 'bg-green-100 text-green-800 border border-green-200' 
//                                 : 'bg-gray-100 text-gray-800 border border-gray-200'
//                             }`}>
//                               {user.is_login ? 'Logged In' : 'Not Logged In'}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {formatDate(user.created_at)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                             <div className="flex items-center space-x-2">
//                               <button
//                                 onClick={() => {
//                                   setSelectedUser(user);
//                                   setDrawerVisible(true);
//                                 }}
//                                 className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
//                                 title="Edit user"
//                               >
//                                 <Edit3 size={16} />
//                               </button>
//                               <button
//                                 onClick={() => handleResetPassword(user.id)}
//                                 className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
//                                 title="Reset password"
//                               >
//                                 <Lock size={16} />
//                               </button>
//                               <button
//                                 onClick={() => handleDelete(user.id)}
//                                 className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
//                                 title="Delete user"
//                               >
//                                 <Trash2 size={16} />
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </>
//         )}

//         {/* Empty State */}
//         {!loading && filteredUsers.length === 0 && (
//           <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
//             <Database size={48} className="mx-auto text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
//             <p className="text-gray-500 mb-6">
//               {users.length === 0 
//                 ? "Get started by adding your first user to the system."
//                 : "Try adjusting your search criteria or filters."}
//             </p>
//             {users.length === 0 ? (
//               <button
//                 onClick={() => {
//                   setSelectedUser(null);
//                   setDrawerVisible(true);
//                 }}
//                 className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Plus size={20} />
//                 <span>Add Your First User</span>
//               </button>
//             ) : (
//               <button
//                 onClick={() => {
//                   setSearchTerm('');
//                   setRoleFilter('all');
//                   setStatusFilter('all');
//                 }}
//                 className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
//               >
//                 <RefreshCw size={20} />
//                 <span>Clear All Filters</span>
//               </button>
//             )}
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && filteredUsers.length > 0 && (
//           <div className="flex items-center justify-between mt-6 px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-200">
//             <div className="flex items-center space-x-2 text-sm text-gray-600">
//               <span>Show</span>
//               <select className="border border-gray-300 rounded px-2 py-1">
//                 <option>10</option>
//                 <option>25</option>
//                 <option>50</option>
//                 <option>100</option>
//               </select>
//               <span>per page</span>
//             </div>
            
//             <div className="flex items-center space-x-2">
//               <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
//                 Previous
//               </button>
//               <div className="flex space-x-1">
//                 <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">1</button>
//                 <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
//                 <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
//               </div>
//               <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
//                 Next
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Drawer with UserForm */}
//         {drawerVisible && (
//           <div className="fixed inset-0 z-50 overflow-hidden">
//             <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setDrawerVisible(false)} />
//             <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl">
//               <div className="flex flex-col h-full">
//                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     {selectedUser ? 'Edit User' : 'Add New User'}
//                   </h2>
//                   <button
//                     onClick={() => setDrawerVisible(false)}
//                     className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//                   >
//                     <X size={24} />
//                   </button>
//                 </div>
                
//                 <div className="flex-1 overflow-y-auto p-6">
//                   <UserForm
//                     initialValues={selectedUser || undefined}
//                     onSubmit={handleSubmit}
//                     loading={formLoading}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdvancedUserManagement;