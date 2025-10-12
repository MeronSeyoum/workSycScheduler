// components/Dashboard/columns/qrCodeColumns.tsx
import React from "react";
import { Space, Tag, Button, Popconfirm, Row, Col, Tooltip, Badge, Divider } from "antd";
import {
  QrcodeOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { QRCode } from "@/lib/types/qrcode";
import { Client } from "@/lib/types/client";

dayjs.extend(relativeTime);

const getExpirationStatus = (expiresAt: string | null) => {
  if (!expiresAt) return { status: "permanent", color: "success", icon: <CheckCircleOutlined /> };
  
  const now = dayjs();
  const expiration = dayjs(expiresAt);
  const daysUntilExpiry = expiration.diff(now, "day");
  
  if (daysUntilExpiry < 0) {
    return { status: "expired", color: "error", icon: <ExclamationCircleOutlined />, daysUntilExpiry };
  }
  if (daysUntilExpiry <= 7) {
    return { status: "expiring-soon", color: "warning", icon: <ClockCircleOutlined />, daysUntilExpiry };
  }
  return { status: "active", color: "success", icon: <CheckCircleOutlined />, daysUntilExpiry };
};

const getStatusLabel = (status: string, daysUntilExpiry?: number) => {
  switch (status) {
    case "expired":
      return "Expired";
    case "expiring-soon":
      return `Expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? "day" : "days"}`;
    case "permanent":
      return "No expiration";
    default:
      return "Active";
  }
};

export const qrCodeTableColumns = (
  onPreview: (qrCode: QRCode) => void,
  onDownload: (id: number) => void,
  onEdit: (qrCode: QRCode) => void,
  onDelete: (id: number) => void
): ColumnsType<QRCode & { client?: Client }> => [
  {
    title: "QR Code",
    dataIndex: "code_value",
    key: "code_value",
    width: "45%",
    responsive: ["md"],
    render: (text: string, record: QRCode & { client?: Client }) => (
      <div className="p-2">
        <Row gutter={[12, 12]} align="middle" wrap={false}>
          <Col flex="none">
            <div className="p-2 bg-blue-50 rounded-lg">
              <QrcodeOutlined className="text-2xl text-blue-500" />
            </div>
          </Col>
          <Col flex="auto" style={{ minWidth: 0 }}>
            <div className="text-sm font-semibold text-gray-900 truncate">
              {record.client?.business_name || "Unnamed QR Code"}
            </div>
            <div className="text-xs text-gray-500 font-mono truncate mt-1" title={text}>
              {text.substring(0, 24)}...
            </div>
          </Col>
        </Row>
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "expires_at",
    key: "expires_at",
    width: "20%",
    responsive: ["md"],
    render: (expiresAt: string | null) => {
      const { status, color, icon, daysUntilExpiry } = getExpirationStatus(expiresAt);
      const label = getStatusLabel(status, daysUntilExpiry);
      
      return (
        <div className="flex items-center gap-2">
          <Tag
            color={color}
            icon={icon}
            className="text-xs font-medium"
            style={{ margin: 0 }}
          >
            {label}
          </Tag>
          {expiresAt && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {dayjs(expiresAt).format("MMM D, YYYY")}
            </span>
          )}
        </div>
      );
    },
  },
  {
    title: "Created",
    dataIndex: "created_at",
    key: "created_at",
    width: "15%",
    responsive: ["lg"],
    render: (created_at: string) => (
      <div>
        <div className="text-sm text-gray-900 font-medium">
          {dayjs(created_at).format("MMM D, YYYY")}
        </div>
        <div className="text-xs text-gray-500">
          {dayjs(created_at).format("h:mm A")}
        </div>
      </div>
    ),
  },
  {
    title: "Actions",
    key: "actions",
    width: "20%",
    responsive: ["sm"],
    align: "right" as const,
    render: (_, record: QRCode) => (
      <Space size="small" wrap>
        {/* Preview */}
        <Tooltip title="Preview QR Code" placement="top">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onPreview(record)}
            className="hover:!bg-blue-50 !text-blue-600"
          />
        </Tooltip>

        {/* Download */}
        <Tooltip title="Download QR Code" placement="top">
          <Button
            type="text"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => onDownload(record.id)}
            className="hover:!bg-green-50 !text-green-600"
          />
        </Tooltip>

        {/* Edit */}
        <Tooltip title="Edit QR Code" placement="top">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="hover:!bg-orange-50 !text-orange-600"
          />
        </Tooltip>

        {/* Delete */}
        <Popconfirm
          title="Delete QR Code"
          description="This action cannot be undone. Are you sure?"
          onConfirm={() => onDelete(record.id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
          }}
        >
          <Tooltip title="Delete QR Code" placement="top">
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
];