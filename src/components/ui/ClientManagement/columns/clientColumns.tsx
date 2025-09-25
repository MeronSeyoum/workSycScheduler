// components/Dashboard/columns/clientColumns.tsx
import React from 'react';
import { Space, Avatar, Tag, Button, Tooltip, Popconfirm } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Client } from '@/lib/types/client';
import { CLIENT_STATUS_COLOR_MAP } from '@/lib/constants/clientDashboard';
interface LocationAddress {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export const clientTableColumns = (
  onEdit: (client: Client) => void,
  onDelete: (client: Client) => void
): ColumnsType<Client> => [
  {
    title: 'Business Info',
    dataIndex: 'business_name',
    key: 'business_name',
    render: (text: string, record: Client) => (
      <Space>
        <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0F6973' }} />
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.contact_person}</div>
        </div>
      </Space>
    ),
  },
  {
    title: 'Contact',
    dataIndex: 'email',
    key: 'email',
    render: (email: string, record: Client) => (
      <div>
        <div className="flex items-center gap-1">
          <MailOutlined className="text-gray-400" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <PhoneOutlined />
          <span>{record.phone}</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Location',
    dataIndex: 'location_address',
    key: 'location',
    render: (address: LocationAddress) => (
      <div className="flex items-center gap-1">
        <EnvironmentOutlined className="text-gray-400" />
        <span>{address ? `${address.city}, ${address.state}` : 'N/A'}</span>
      </div>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: 'active' | 'inactive' | 'on_hold') => (
      <Tag color={CLIENT_STATUS_COLOR_MAP[status]} className="capitalize">
        {status}
      </Tag>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record: Client) => (
      <Space>
        <Tooltip title="Edit Client">
          <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} />
        </Tooltip>
        <Tooltip title="View QR Codes">
          <Button icon={<QrcodeOutlined />} size="small" />
        </Tooltip>
        <Popconfirm
          title="Delete Client"
          description="Are you sure you want to delete this client? This action cannot be undone."
          onConfirm={() => onDelete(record)}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete Client">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
  },
];

