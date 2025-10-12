// components/Dashboard/columns/clientColumns.tsx
import React from "react";
import { Space, Avatar, Tag, Button, Tooltip, Popconfirm, Row, Col, Badge } from "antd";
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Client } from "@/lib/types/client";
import { CLIENT_STATUS_COLOR_MAP } from "@/lib/constants/clientDashboard";

interface LocationAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

const getStatusIcon = (status: "active" | "inactive" | "on_hold") => {
  switch (status) {
    case "active":
      return <CheckCircleOutlined />;
    case "on_hold":
      return <ClockCircleOutlined />;
    case "inactive":
      return <StopOutlined />;
    default:
      return null;
  }
};

const formatAddress = (address: LocationAddress | undefined) => {
  if (!address) return "N/A";
  const parts = [address.street, address.city, address.state, address.postal_code].filter(Boolean);
  return parts.join(", ");
};

export const clientTableColumns = (
  onEdit: (client: Client) => void,
  onDelete: (client: Client) => void
): ColumnsType<Client> => [
  {
    title: "Business",
    dataIndex: "business_name",
    key: "business_name",
    width: "35%",
    render: (text: string, record: Client) => (
      <div className="py-2">
        <Row gutter={[12, 8]} align="middle" wrap={false}>
          <Col flex="none">
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#009688" }}
            />
          </Col>
          <Col flex="auto" style={{ minWidth: 0 }}>
            <div className="font-semibold text-gray-900 truncate">
              {text || "Unnamed Business"}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {record.contact_person || "No contact"}
            </div>
          </Col>
        </Row>
      </div>
    ),
  },
  {
    title: "Contact",
    dataIndex: "email",
    key: "email",
    width: "25%",
    render: (email: string, record: Client) => (
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-700">
          <MailOutlined className="text-blue-600 flex-shrink-0" />
          <span className="truncate" title={email}>
            {email || "No email"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <PhoneOutlined className="text-blue-600 flex-shrink-0" />
          <span className="truncate" title={record.phone || "No phone"}>
            {record.phone || "No phone"}
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Location",
    dataIndex: "location_address",
    key: "location",
    width: "20%",
    render: (address: LocationAddress) => (
      <div className="flex items-start gap-2 text-sm text-gray-700">
        <EnvironmentOutlined className="text-blue-600 flex-shrink-0 mt-0.5" />
        <span className="truncate" title={formatAddress(address)}>
          {formatAddress(address)}
        </span>
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: "10%",
    align: "center" as const,
    render: (status: "active" | "inactive" | "on_hold") => (
      <Tag
        icon={getStatusIcon(status)}
        color={CLIENT_STATUS_COLOR_MAP[status]}
        className="font-medium"
        style={{
          textTransform: "capitalize",
          border: "none",
          padding: "4px 10px",
        }}
      >
        {status === "on_hold" ? "On hold" : status}
      </Tag>
    ),
  },
  {
    title: "Actions",
    key: "actions",
    width: "10%",
    align: "right" as const,
    render: (_, record: Client) => (
      <Space size="small" wrap>
        {/* Edit */}
        <Tooltip title="Edit Client" placement="top">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="hover:!bg-teal-50 !text-teal-600"
          />
        </Tooltip>

        {/* View QR Codes */}
        <Tooltip title="View QR Codes" placement="top">
          <Button
            type="text"
            size="small"
            icon={<QrcodeOutlined />}
            className="hover:!bg-blue-50 !text-blue-600"
          />
        </Tooltip>

        {/* Delete */}
        <Popconfirm
          title="Delete Client"
          description="This action cannot be undone. All associated data will be removed."
          onConfirm={() => onDelete(record)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
          }}
          cancelButtonProps={{
            type: "default",
          }}
        >
          <Tooltip title="Delete Client" placement="top">
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