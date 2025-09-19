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
  Tabs,
  Spin,
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
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ExportOutlined,
  ShopOutlined,
  QrcodeOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  AimOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";
import { useAuth } from "@/components/providers/AuthProvider";
import { Client, ClientStatus } from "@/lib/types/client";
import { QRCode } from "@/lib/types/qrcode";
import { Geofence } from "@/lib/types/geofence";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/common/skeleton";
import ClientForm from "@/components/form/ClientForm";
import QRCodeForm from "@/components/form/QRCodeForm";
import QRCodePreviewModal from "@/components/modal/QRCodePreviewModal";
import GeofenceForm from "@/components/form/GeofenceForm";
import { useDebounce } from "use-debounce";

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

// Status options and color maps
const clientStatusOptions: ClientStatus[] = ["active", "inactive", "on_hold"];
const clientStatusColorMap: Record<ClientStatus, string> = {
  active: "green",
  inactive: "red",
  on_hold: "orange",
};

// Notification hook
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

// Simple map component for geofences
const SimpleLocationMap = ({ lat, lng, radius }: { lat: number; lng: number; radius: number }) => {
  return (
    <div className="relative w-24 h-24 bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
      <div 
        className="absolute w-4 h-4 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          left: '50%', 
          top: '50%',
          boxShadow: '0 0 0 2px white, 0 0 0 4px #0F6973'
        }}
      />
      <div 
        className="absolute border-2 border-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          left: '50%', 
          top: '50%',
          width: `${Math.min(radius / 50, 90)}%`,
          height: `${Math.min(radius / 50, 90)}%`,
        }}
      />
      <div className="absolute bottom-1 left-1 text-xs text-blue-700 font-medium">
        {radius}m
      </div>
    </div>
  );
};

const LocationPage: React.FC = () => {
  const { token } = useAuth();
  const { showNotification, contextHolder } = useNotification();
  const [activeTab, setActiveTab] = useState<string>("clients");
  
  // State for all three components
  const [clients, setClients] = useState<Client[]>([]);
  const [qrcodes, setQRCodes] = useState<QRCode[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  
  const [loading, setLoading] = useState({
    clients: false,
    qrcodes: false,
    geofences: false,
    clientsData: false,
    form: false,
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCode | null>(null);
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  const [tableParams, setTableParams] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50"],
  });

  // Fetch all clients (used for QR codes and geofences)
  const fetchAllClients = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(prev => ({ ...prev, clientsData: true }));
      const response = await api.clients.fetchClients(token);
      const clientData: Client[] = Array.isArray(response) ? response : response || [];
      setAllClients(clientData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load clients";
      showNotification("error", "Loading Failed", errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, clientsData: false }));
    }
  }, [token, showNotification]);

  // Fetch clients data
  const fetchClients = useCallback(async () => {
    if (!token) {
      showNotification("error", "Authentication Required", "Please login to access client data");
      return;
    }

    setLoading(prev => ({ ...prev, clients: true }));
    try {
      const response = await api.clients.fetchClients(token);
      const clientData: Client[] = Array.isArray(response) ? response : response || [];
      setClients(clientData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load clients";
      showNotification("error", "Loading Failed", errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  }, [token, showNotification]);

  // Fetch QR codes data
  const fetchQRCodes = useCallback(async () => {
    if (!token) return;

    setLoading(prev => ({ ...prev, qrcodes: true }));
    try {
      const response = await api.qrCodes.fetchQRCodes(token, {
        page: tableParams.current,
        limit: tableParams.pageSize,
      });
      
      const qrCodesData = response.data || response || [];
      setQRCodes(qrCodesData);
      
      setTableParams(prev => ({
        ...prev,
        pagination: {
          ...prev,
          total: response.total || qrCodesData.length,
        },
      }));
    } catch (error: any) {
      showNotification("error", "Failed to load QR codes", error.message);
    } finally {
      setLoading(prev => ({ ...prev, qrcodes: false }));
    }
  }, [token, tableParams.current, tableParams.pageSize, showNotification]);

  // Fetch geofences data
  const fetchGeofences = useCallback(async () => {
    if (!token) return;
    
    setLoading(prev => ({ ...prev, geofences: true }));
    try {
      const data = await api.geofence.api.geofence.fetchAll(token);
      setGeofences(data);
    } catch (error: any) {
      showNotification('error', 'Failed to load geofences', error.message);
    } finally {
      setLoading(prev => ({ ...prev, geofences: false }));
    }
  }, [token, showNotification]);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "clients") {
      fetchClients();
    } else if (activeTab === "qrcodes") {
      fetchQRCodes();
      fetchAllClients();
    } else if (activeTab === "geofences") {
      fetchGeofences();
      fetchAllClients();
    }
  }, [activeTab, fetchClients, fetchQRCodes, fetchGeofences, fetchAllClients]);

  // Filter functions for each tab
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

  const filteredQRCodes = useMemo(() => {
    if (!searchTerm) return qrcodes;

    return qrcodes.filter(
      (qrcode) =>
        qrcode.client_id.toString().includes(searchTerm) ||
        qrcode.code_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (qrcode.client &&
          qrcode.client.business_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, qrcodes]);

  const filteredGeofences = useMemo(() => {
    const results = geofences.filter(geofence => {
      const clientName = geofence.client?.business_name?.toLowerCase() || '';
      const clientId = geofence.client_id.toString();
      
      return clientName.includes(searchTerm.toLowerCase()) || 
             clientId.includes(searchTerm);
    });
    return results;
  }, [searchTerm, geofences]);

  // Handler functions for clients
  const handleClientSubmit = useCallback(
    async (values: Client | Omit<Client, "id">) => {
      setLoading(prev => ({ ...prev, form: true }));
      try {
        const isUpdate = "id" in values;

        // Create a clean payload without id
        const { id, notes, ...rest } = values as Client;
        const payload = {
          ...rest,
          notes: notes ?? "", // Ensure notes is always a string
        };

        if (isUpdate) {
          await api.clients.updateClient(id, payload, token!);
        } else {
          await api.clients.createClient(payload, token!);
        }

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
        setLoading(prev => ({ ...prev, form: false }));
      }
    },
    [token, fetchClients, showNotification]
  );

  const handleClientDelete = useCallback(
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

  // Handler functions for QR codes
  const handleQRCodeCreate = async (values: { client_id: number; expires_at?: Date }) => {
    if (!token) return;

    setLoading(prev => ({ ...prev, form: true }));
    try {
      await api.qrCodes.createQRCode(
        {
          client_id: values.client_id,
          expires_at: values.expires_at,
        },
        token
      );

      showNotification("success", "QR Code created successfully");
      setDrawerVisible(false);
      await fetchQRCodes();
    } catch (error: any) {
      showNotification("error", "Failed to create QR Code", error.message);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleQRCodeUpdate = async (values: { client_id: number; expires_at?: Date }) => {
    if (!selectedQRCode || !token) return;

    setLoading(prev => ({ ...prev, form: true }));
    try {
      await api.qrCodes.updateQRCode(
        selectedQRCode.id,
        {
          expires_at: values.expires_at,
        },
        token
      );
      showNotification("success", "QR Code updated successfully");
      setDrawerVisible(false);
      await fetchQRCodes();
    } catch (error: any) {
      showNotification("error", "Failed to update QR Code", error.message);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleQRCodeDelete = async (id: number) => {
    if (!token) return;

    try {
      await api.qrCodes.deleteQRCode(id, token);
      showNotification("success", "QR Code deleted successfully");
      await fetchQRCodes();
    } catch (error: any) {
      showNotification("error", "Failed to delete QR Code", error.message);
    }
  };

  const handleQRCodeDownload = async (id: number) => {
    if (!token) return;

    try {
      const qrCode = qrcodes.find((q) => q.id === id);
      if (!qrCode) return;

      const blob = await api.qrCodes.downloadQRCode(id, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${qrCode.code_value}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showNotification("success", "QR code downloaded successfully");
    } catch (error: any) {
      showNotification("error", "Failed to download QR Code", error.message);
    }
  };

  // Handler functions for geofences
  const handleGeofenceSubmit = useCallback(async (values: { 
    client_id: number; 
    latitude: string | number; 
    longitude: string | number; 
    radius_meters: number; 
  }) => {
    if (!token) return;
    
    setLoading(prev => ({ ...prev, form: true }));
    try {
      // Convert latitude and longitude to numbers if they're strings
      const processedValues: Partial<Geofence> = {
        client_id: values.client_id,
        latitude: typeof values.latitude === 'string' ? parseFloat(values.latitude) : values.latitude,
        longitude: typeof values.longitude === 'string' ? parseFloat(values.longitude) : values.longitude,
        radius_meters: values.radius_meters,
      };

      if (selectedGeofence) {
        await api.geofence.api.geofence.update(selectedGeofence.id, processedValues as Geofence, token);
        showNotification('success', 'Geofence updated successfully');
      } else {
        await api.geofence.api.geofence.create(processedValues as Omit<Geofence, 'id'>, token);
        showNotification('success', 'Geofence created successfully');
      }
      setDrawerVisible(false);
      await fetchGeofences();
    } catch (error: any) {
      const action = selectedGeofence ? 'update' : 'create';
      showNotification('error', `Failed to ${action} geofence`, error.message);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  }, [selectedGeofence, token, showNotification, fetchGeofences]);

  const handleGeofenceDelete = useCallback(async (id: number) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this geofence?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.geofence.api.geofence.delete(id, token!);
          showNotification('success', 'Geofence deleted successfully');
          await fetchGeofences();
        } catch (error: any) {
          showNotification('error', 'Failed to delete geofence', error.message);
        }
      }
    });
  }, [token, showNotification, fetchGeofences]);

  const getClientName = useCallback((clientId: number, clientsList: Client[]) => {
    const client = clientsList.find(c => c.id === clientId);
    return client?.business_name || `Client ${clientId}`;
  }, []);

  // Table columns for each tab
  const clientColumns: ColumnsType<Client> = useMemo(
    () => [
      {
        title: "CLIENT",
        key: "client",
        width: 250,
        fixed: "left",
        render: (_, record) => (
          <Flex align="center" gap={12}>
            <Badge dot color={clientStatusColorMap[record.status]} offset={[-5, 40]}>
              <Avatar
                size={34}
                icon={<ShopOutlined />}
                style={{ backgroundColor: "#0F6973" }}
              />
            </Badge>
            <div>
              <Text
                strong
                style={{ display: "block", fontSize: 15, color: "#0F6973" }}
              >
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
              <Text style={{ fontSize: 12 }}>{record.email}</Text>
            </div>
            {record.phone && (
              <div>
                <PhoneOutlined style={{ color: "#0F6973", marginRight: 8 }} />
                <Text style={{ fontSize: 12 }}>{record.phone}</Text>
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
          const address = record.location_address;
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
                <Text style={{ fontSize: 12 }}>
                  {[
                    address.street,
                    address.city,
                    address.state,
                    address.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
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
        filters: clientStatusOptions.map((status) => ({
          text: status.charAt(0).toUpperCase() + status.slice(1),
          value: status,
        })),
        onFilter: (value, record) => record.status === value,
        render: (_, record) => (
          <Tag
            color={clientStatusColorMap[record.status]}
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
                  handleClientDelete(record.id);
                }}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [handleClientDelete]
  );

  const qrCodeColumns: ColumnsType<QRCode> = [
    {
      title: "QR CODE",
      key: "code",
      width: 250,
      render: (_, record) => (
        <Flex align="center" gap={12}>
          <Avatar
            size={40}
            icon={<QrcodeOutlined />}
            style={{ backgroundColor: "#fff", color: "#0F6973" }}
          />
          <Text strong style={{ color: "#0F6973" }}>
            {record.code_value}
          </Text>
        </Flex>
      ),
    },
    {
      title: "CLIENT",
      key: "client",
      render: (_, record) => (
        <div>
          <Text style={{ color: "#0F6973" }} strong>
            {record.client?.business_name || "N/A"}
          </Text>
          <br />
          <Text type="secondary">{record.client?.email || ""}</Text>
        </div>
      ),
    },
    {
      title: "EXPIRATION",
      dataIndex: "expires_at",
      key: "expires",
      render: (expiresAt) =>
        expiresAt ? (
          <Tag
            color={dayjs().isAfter(dayjs(expiresAt)) ? "red" : "green"}
            icon={<ClockCircleOutlined />}
          >
            {dayjs(expiresAt).format("MMM D, YYYY h:mm A")}
          </Tag>
        ) : (
          <Tag color="blue">Never expires</Tag>
        ),
    },
    {
      title: "STATUS",
      key: "status",
      render: (_, record) => (
        <Badge
          status={
            record.expires_at && dayjs().isAfter(dayjs(record.expires_at))
              ? "error"
              : "success"
          }
          text={
            record.expires_at && dayjs().isAfter(dayjs(record.expires_at))
              ? "Expired"
              : "Active"
          }
        />
      ),
    },
    {
      title: "ACTIONS",
      key: "actions",
      width: 180,
      render: (_, record) => {
        // Find the full client details from the clients state
        const fullClient = allClients.find(
          (client) => client.id === record.client_id
        );
        return (
          <Space>
            <Tooltip title="Preview QR Code">
              <Button
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedQRCode({
                    ...record,
                    client: fullClient
                      ? {
                          id: fullClient.id,
                          business_name: fullClient.business_name,
                          email: fullClient.email,
                          contact_person:
                            fullClient.contact_person ?? undefined,
                          location_address: fullClient.location_address,
                        }
                      : undefined,
                  });
                  setPreviewVisible(true);
                }}
              />
            </Tooltip>
            <Tooltip title="Download QR Code">
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleQRCodeDownload(record.id)}
              />
            </Tooltip>
            <Tooltip title="Edit QR Code">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setSelectedQRCode(record);
                  setDrawerVisible(true);
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Delete QR Code"
              description="Are you sure to delete this QR code?"
              onConfirm={() => handleQRCodeDelete(record.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete QR Code">
                <Button icon={<DeleteOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const geofenceColumns: ColumnsType<Geofence> = [
    {
      title: 'CLIENT',
      dataIndex: 'client_id',
      key: 'client',
      width: 250,
      render: (clientId, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            size={36} 
            icon={<EnvironmentOutlined />}
            className="bg-teal-700"
          />
          <div>
            <div className="text-sm font-semibold">
              {record.client?.business_name || getClientName(clientId, allClients)}
            </div>
            <div className="text-xs text-gray-500">
              ID: {clientId}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'LOCATION',
      key: 'location',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <SimpleLocationMap 
            lat={record.latitude} 
            lng={record.longitude} 
            radius={record.radius_meters} 
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs">
              <AimOutlined className="text-teal-700 text-xs" />
              <span className="font-medium">Lat:</span> 
              <span>{record.latitude}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <AimOutlined className="text-teal-700 text-xs" />
              <span className="font-medium">Lng:</span> 
              <span>{record.longitude}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'RADIUS',
      dataIndex: 'radius_meters',
      key: 'radius',
      align: 'center' as const,
      render: (radius) => (
        <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
          {radius}m
        </span>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button 
            icon={<EditOutlined />} 
            className="border-teal-700 text-teal-700 hover:border-teal-600 hover:text-teal-600"
            onClick={() => {
              setSelectedGeofence(record);
              setDrawerVisible(true);
            }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleGeofenceDelete(record.id)}
          />
        </div>
      )
    }
  ];

  // Render the appropriate form based on active tab
  const renderForm = () => {
    switch (activeTab) {
      case "clients":
        return (
          <ClientForm
            initialValues={selectedClient || undefined}
            onSubmit={handleClientSubmit}
            loading={loading.form}
          />
        );
      case "qrcodes":
        return (
          <QRCodeForm
            initialValues={selectedQRCode || undefined}
            onSubmit={selectedQRCode ? handleQRCodeUpdate : handleQRCodeCreate}
            loading={loading.form}
            clients={allClients}
          />
        );
      case "geofences":
        return (
          <GeofenceForm
            initialValues={selectedGeofence || undefined}
            onSubmit={handleGeofenceSubmit}
            loading={loading.form}
            clients={allClients}
          />
        );
      default:
        return null;
    }
  };

  // Render the appropriate table based on active tab
  const renderTable = () => {
    switch (activeTab) {
      case "clients":
        return (
          <Table
            columns={clientColumns}
            dataSource={filteredClients}
            rowKey="id"
            loading={loading.clients}
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
        );
      case "qrcodes":
        return (
          <Table
            columns={qrCodeColumns}
            dataSource={filteredQRCodes}
            rowKey="id"
            loading={loading.qrcodes}
            pagination={tableParams}
            scroll={{ x: 1000 }}
            bordered
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
            }}
          />
        );
      case "geofences":
        return (
          <Table
            columns={geofenceColumns}
            dataSource={filteredGeofences}
            rowKey="id"
            loading={loading.geofences}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
            className="border border-gray-300 rounded-lg overflow-hidden"
            scroll={{ x: 800 }}
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
            bordered
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
            }}
          />
        );
      default:
        return null;
    }
  };

  // Render the appropriate action buttons based on active tab
  const renderActionButtons = () => {
    switch (activeTab) {
      case "clients":
        return (
          <>
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
          </>
        );
      case "qrcodes":
        return (
          <Button
            style={{ backgroundColor: "#0F6973", color: "white" }}
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedQRCode(null);
              setDrawerVisible(true);
            }}
          >
            Generate QR Code
          </Button>
        );
      case "geofences":
        return (
          <Button 
            type="primary"
            style={{ 
              backgroundColor: '#0F6973', 
              borderColor: '#0F6973',
              borderRadius: '8px',
              fontWeight: '500'
            }}
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedGeofence(null);
              setDrawerVisible(true);
            }}
          >
            Add Geofence
          </Button>
        );
      default:
        return null;
    }
  };

  // Render the appropriate search/filter UI based on active tab
  const renderSearchFilter = () => {
    switch (activeTab) {
      case "clients":
        return (
          <>
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
              {clientStatusOptions.map((status) => (
                <Option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Option>
              ))}
            </Select>
          </>
        );
      case "qrcodes":
        return (
          <Input
            placeholder="Search QR codes..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        );
      case "geofences":
        return (
          <Input
            placeholder="Search clients or IDs..."
            prefix={<SearchOutlined />}
            style={{ width: 280, borderRadius: '8px' }}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {contextHolder}
      <div className="m-4 rounded-lg pt-4">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          style={{ marginBottom: 16 }}
        >
          <TabPane tab="Clients" key="clients" />
          <TabPane tab="QR Codes" key="qrcodes" />
          <TabPane tab="Geofences" key="geofences" />
        </Tabs>

        <div style={{ marginBottom: 24 }} className="flex justify-between">
          <Flex gap={16} wrap="wrap">
            {renderSearchFilter()}
          </Flex>
          <div className="flex justify-end gap-4">
            {renderActionButtons()}
          </div>
        </div>

        {renderTable()}

        <Drawer
          title={
            activeTab === "clients" 
              ? (selectedClient ? "Edit Client" : "Add Client")
              : activeTab === "qrcodes"
              ? (selectedQRCode ? "Edit QR Code" : "Generate QR Code")
              : (selectedGeofence ? "Edit Geofence" : "Add Geofence")
          }
          width={720}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          styles={{
            body: { padding: "24px 0" },
          }}
        >
          {renderForm()}
        </Drawer>

        {activeTab === "qrcodes" && (
          <QRCodePreviewModal
            visible={previewVisible}
            onClose={() => setPreviewVisible(false)}
            qrCode={selectedQRCode}
            onDownload={() => selectedQRCode && handleQRCodeDownload(selectedQRCode.id)}
          />
        )}
      </div>
    </>
  );
};

export default LocationPage;