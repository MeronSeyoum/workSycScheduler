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
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ExportOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useAuth } from "@/components/AuthProvider";
import { Client, ClientStatus } from "@/types/client";
import { api } from "@/service/api"; // Updated import

import ClientForm from "@/components/form/ClientForm";
import { useDebounce } from "use-debounce";

const { Option } = Select;
const { Text } = Typography;

const statusOptions: ClientStatus[] = ["active", "inactive", "on_hold"];

const statusColorMap: Record<ClientStatus, string> = {
  active: "green",
  inactive: "red",
  on_hold: "orange",
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

const ClientPage: React.FC = () => {
  const { token } = useAuth();
  const { showNotification, contextHolder } = useNotification();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const filteredClients = useMemo(() => {
    let result = [...clients];
    const term = debouncedSearchTerm.toLowerCase();

    if (debouncedSearchTerm) {
      result = result.filter(
        (client) =>
          client.business_name?.toLowerCase().includes(term) ||
          client.contact_person?.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term) ||
          client.phone?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((client) => client.status === statusFilter);
    }

    return result;
  }, [clients, debouncedSearchTerm, statusFilter]);

  const fetchClients = useCallback(async () => {
    if (!token) {
      showNotification(
        "error",
        "Authentication Required",
        "Please login to access client data"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.clients.fetchClients(token);
      const clientData: Client[] = Array.isArray(response)
        ? response
        : response || [];
      setClients(clientData);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load clients";
      showNotification("error", "Loading Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token, showNotification]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSubmit = useCallback(
    async (values: Client | Omit<Client, "id">) => {
      setFormLoading(true);
      try {
        const isUpdate = "id" in values;
        const action = isUpdate
          ? api.clients.updateClient(values.id, values, token!)
          : api.clients.createClient(values, token!);

        await action;
        showNotification(
          "success",
          isUpdate ? "Client Updated" : "Client Created",
          `${values.business_name} ${
            isUpdate ? "updated" : "added"
          } successfully`
        );
        setDrawerVisible(false);
        await fetchClients();
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
    [token, fetchClients, showNotification]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      const client = clients.find((c) => c.id === id);
      if (!client) return;

      Modal.confirm({
        title: "Confirm Delete",
        icon: <ExclamationCircleOutlined />,
        content: `Are you sure you want to delete ${client.business_name}? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        style: { zIndex: 999 },
        onOk: async () => {
          try {
            await api.clients.deleteClient(id, token!);
            showNotification(
              "success",
              "Client Deleted",
              `${client.business_name} was removed`
            );
            await fetchClients();
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to delete client";
            showNotification("error", "Deletion Failed", errorMessage);
          }
        },
        onCancel: () => {
          showNotification(
            "info",
            "Deletion Cancelled",
            "Client was not deleted"
          );
        },
      });
    },
    [clients, token, fetchClients, showNotification]
  );

  const handleBulkExport = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      showNotification(
        "info",
        "No Clients Selected",
        "Please select clients to export"
      );
      return;
    }
    // Implement actual export logic here
    showNotification(
      "success",
      "Export Started",
      `Preparing ${selectedRowKeys.length} clients for export`
    );
  }, [selectedRowKeys, showNotification]);

  const columns: ColumnsType<Client> = useMemo(
    () => [
      {
        title: "CLIENT",
        key: "client",
        width: 250,
        fixed: "left",
        render: (_, record) => (
          <Flex align="center" gap={12}>
            <Badge dot color={statusColorMap[record.status]} offset={[-5, 40]}>
              <Avatar
                size={34}
                icon={<ShopOutlined />}
                style={{ backgroundColor: "#0F6973" }}
              />
            </Badge>
            <div>
              <Text strong style={{ display: "block", fontSize: 15 ,  color: '#0F6973' }}>
                {record.business_name}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {record.contact_person || "No contact"}
              </Text>
            </div>
          </Flex>
        ),
        sorter: (a, b) => a.business_name.localeCompare(b.business_name),
      },
      {
        title: "CONTACT",
        key: "contact",
        width: 150,
        render: (_, record) => (
          <div>
            <div style={{ marginBottom: 6 }}>
              <MailOutlined style={{ color: "#0F6973", marginRight: 8 }} />
              <Text style={{fontSize: 12}}>{record.email}</Text>
            </div>
            {record.phone && (
              <div>
                <PhoneOutlined style={{ color: "#0F6973", marginRight: 8 }} />
                <Text style={{fontSize: 12}}>{record.phone}</Text>
              </div>
            )}
          </div>
        ),
      },
      {
        title: "LOCATION",
        key: "location",
        width: 280,
        render: (_, record) => {
          const address = record.location_address ;
          if (!address) return <Text type="secondary">No address</Text>;

          return (
            <Tooltip
              title={`${address.street || ""} ${address.city || ""} ${
                address.postal_code || ""
              }`}
              placement="topLeft"
            >
              <div>
                <EnvironmentOutlined
                  style={{ color: "#fa8c16", marginRight: 8 }}
                />
                <Text style={{fontSize: 12}}>
                  {[address.street, address.city, address.state, address.postal_code].filter(Boolean).join(", ")}
                </Text>
              </div>
            </Tooltip>
          );
        },
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
        width: 100,
        fixed: "right",
        render: (_, record) => (
          <Space>
            <Tooltip title="Edit client">
              <Button
                shape="circle"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedClient(record);
                  setDrawerVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Delete client">
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
    ],
    [handleDelete]
  );

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
      <div className=" m-4 rounded-lg pt-4">
        <div>
          <div style={{ marginBottom: 24 }} className="flex justify-between">
            <Flex gap={16} wrap="wrap">
              <Input
                placeholder="Search clients..."
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
              </Select>{" "}
            </Flex>
            <div className="flex justify-end gap-4 ">
              {selectedRowKeys.length > 0 && (
                <Button icon={<ExportOutlined />} onClick={handleBulkExport}>
                  Export Selected
                </Button>
              )}
              <Button
                style={{ backgroundColor: "#0F6973", color: "white" }}
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedClient(null);
                  setDrawerVisible(true);
                }}
              >
                Add Client
              </Button>
            </div>
          </div>

          {/* {loading && clients.length === 0 ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : ( */}
            <Table
              columns={columns}
              dataSource={filteredClients}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `Total ${total} clients`,
              }}
              scroll={{ x: 900, y: "calc(100vh - 350px)" }}
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
                  setSelectedClient(record);
                },
              })}
              // Add these props for sharper styling
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
                      {clients.length === 0
                        ? "No clients in the system yet"
                        : "No matching clients found"}
                    </Text>
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setSelectedClient(null);
                        setDrawerVisible(true);
                      }}
                      style={{
                        marginTop: 16,
                        backgroundColor: "#0F6973",
                        color: "white",
                      }}
                    >
                      Add Client
                    </Button>
                  </div>
                ),
              }}
            />
          {/* )} */}
        </div>
        <Drawer
          title={selectedClient ? "Edit Client" : "Add Client"}
          width={720}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          styles={{
            body: { padding: "24px 0" },
          }}
        >
          <ClientForm
            initialValues={selectedClient || undefined}
            onSubmit={handleSubmit}
            loading={formLoading}
          />
        </Drawer>
      </div>
                    )}
    </>
  );
};

export default ClientPage;
