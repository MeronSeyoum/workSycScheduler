"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Avatar,
  Flex,
  Typography,
  Drawer,
  Tooltip,
  Badge,
  Popconfirm,
  notification,
  Spin,
} from "antd";
import {
  QrcodeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";
import { useAuth } from "@/components/AuthProvider";
import { api as apiCall } from "@/service/api";
import { QRCode } from "@/types/qrcode";
import { Client } from "@/types/client";
import QRCodeForm from "../../components/form/QRCodeForm";
import QRCodePreviewModal from "../../components/QRCodePreviewModal";
import { Skeleton } from "@/components/ui/skeleton";

const {  Text } = Typography;

interface TableParams {
  pagination: TablePaginationConfig;
}

interface QRCodeFormValues {
  client_id: number;
  expires_at?: Date;
}

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

const QRCodePage: React.FC = () => {
  const { token } = useAuth();
  const { showNotification, contextHolder } = useNotification();

  // State management
 const [qrcodes, setQRCodes] = useState<QRCode[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState({
    table: false,
    clients: false,
    form: false,
  });
    const [load, setLoad] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentQRCode, setCurrentQRCode] = useState<QRCode | null>(null);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: ["10", "20", "50"],
    },
  });

  // Data fetching
  const fetchData = useCallback(async () => {
    if (!token) return;

 try {
  // setLoading(prev => ({ ...prev, table: true, clients: true }));
  setLoad(true)
  
  // Parallel fetching of QR codes and clients
  const [qrCodesResponse, clientsResponse] = await Promise.all([
    apiCall.qrCodes.fetchQRCodes(token, {
      page: tableParams.pagination?.current,
      limit: tableParams.pagination?.pageSize,
    }),
    apiCall.clients.fetchClients(token)
  ]);

  // Extract the data array from the paginated response
  const qrCodesData = qrCodesResponse.data || qrCodesResponse || [];
  setQRCodes(qrCodesData);
  setClients(clientsResponse || []);
  
  setTableParams(prev => ({
    ...prev,
    pagination: {
      ...prev.pagination,
      total: qrCodesResponse.total || qrCodesData.length,
    },
  }));
} catch (error: any) {
  showNotification("error", "Failed to load data", error.message);
} finally {
  // setLoading(prev => ({ ...prev, table: false, clients: false }));
  setLoad(false)
}
  }, [token, tableParams.pagination?.current, tableParams.pagination?.pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter QR codes based on search term
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

  // Handlers
  const handleCreate = async (values: QRCodeFormValues) => {
    if (!token) return;

    setLoading(prev => ({ ...prev, form: true }));
    
    try {
      await apiCall.qrCodes.createQRCode(
        {
          client_id: values.client_id,
          expires_at: values.expires_at,
        },
        token
      );
      
      showNotification("success", "QR Code created successfully");
      setDrawerVisible(false);
      await fetchData();
    } catch (error: any) {
      showNotification("error", "Failed to create QR Code", error.message);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleUpdate = async (values: QRCodeFormValues) => {
    if (!currentQRCode || !token) return;

    setLoading(prev => ({ ...prev, form: true }));
    try {
      await apiCall.qrCodes.updateQRCode(
        currentQRCode.id,
        {
          expires_at: values.expires_at,
        },
        token
      );
      showNotification("success", "QR Code updated successfully");
      setDrawerVisible(false);
      await fetchData();
    } catch (error: any) {
      showNotification("error", "Failed to update QR Code", error.message);
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    
    try {
      await apiCall.qrCodes.deleteQRCode(id, token);
      showNotification("success", "QR Code deleted successfully");
      await fetchData();
    } catch (error: any) {
      showNotification("error", "Failed to delete QR Code", error.message);
    }
  };

  const handleDownload = async (id: number) => {
    if (!token) return;
    
    try {
      const qrCode = qrcodes.find((q) => q.id === id);
      if (!qrCode) return;

      const blob = await apiCall.qrCodes.downloadQRCode(id, token);
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

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setTableParams({
      pagination,
    });
  };

  // Table columns
  const columns: ColumnsType<QRCode> = [
    {
      title: "QR CODE",
      key: "code",
      width: 250,
      render: (_, record) => (
        <Flex align="center" gap={12}>
          <Avatar
            size={40}
            icon={<QrcodeOutlined />}
            style={{ backgroundColor: "#fff", color: '#0F6973' }}
          />
          <Text strong style={{  color: '#0F6973' }}>{record.code_value}</Text>
        </Flex>
      ),
    },
    {
      title: "CLIENT",
      key: "client",
      render: (_, record) => (
        <div>
          <Text style={{  color: '#0F6973' }} strong>{record.client?.business_name || "N/A"}</Text>
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
    const fullClient = clients.find(client => client.id === record.client_id);
    console.log("Clinet Data: ", fullClient)
    return (
        <Space>
          <Tooltip title="Preview QR Code">
            <Button
              icon={<EyeOutlined />}
                onClick={() => {
              setCurrentQRCode({
                ...record,
                client: fullClient ? {
                  id: fullClient.id,
                  business_name: fullClient.business_name,
                  email: fullClient.email,
                  contact_person: fullClient.contact_person,
                  location_address: fullClient.location_address
                } : undefined
              });
              setPreviewVisible(true);
            }}
            />
          </Tooltip>
          <Tooltip title="Download QR Code">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit QR Code">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setCurrentQRCode(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete QR Code"
            description="Are you sure to delete this QR code?"
            onConfirm={() => handleDelete(record.id)}
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
  }
},
  ];

  return (
    <>
      {contextHolder}
       {load? (
                      <div className="p-4 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        {[...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : (
      <div className="m-4 rounded-lg pt-4">
        <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
          <Flex gap={16} className="flex-1 flex-row justify-between">
            <Input
              placeholder="Search QR codes..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
            <Button
              style={{ backgroundColor: "#0F6973", color: "white" }}
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentQRCode(null);
                setDrawerVisible(true);
              }}
            >
              Generate QR Code
            </Button>
          </Flex>
        </Flex>

        <Spin spinning={loading.table}>
          <Table
            columns={columns}
            dataSource={filteredQRCodes}
            rowKey="id"
            loading={loading.table}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            bordered
            style={{
              backgroundColor: "#fff",
              borderRadius: 8,
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
            }}
          />
        </Spin>

        <Drawer
          title={currentQRCode ? "Edit QR Code" : "Generate QR Code"}
          width={720}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          destroyOnClose
          styles={{
            body: {
              paddingBottom: 80,
            },
          }}
        >
          <QRCodeForm
            initialValues={currentQRCode || undefined}
            onSubmit={currentQRCode ? handleUpdate : handleCreate}
            loading={loading.form}
            clients={clients}
          />
        </Drawer>

     <QRCodePreviewModal
  visible={previewVisible}
  onClose={() => setPreviewVisible(false)}
  qrCode={currentQRCode}
  onDownload={() => currentQRCode && handleDownload(currentQRCode.id)}
/>
      </div>
                    )}
    </>
  );
};

export default QRCodePage;