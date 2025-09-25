// components/Dashboard/columns/qrCodeColumns.tsx
import React from 'react';
import { Space, Tag, Button, Popconfirm } from 'antd';
import { QrcodeOutlined, ClockCircleOutlined, EyeOutlined, DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { QRCode } from '@/lib/types/qrcode';
import { Client } from '@/lib/types/client';

export const qrCodeTableColumns = (
  onPreview: (qrCode: QRCode) => void,
  onDownload: (id: number) => void,
  onEdit: (qrCode: QRCode) => void,
  onDelete: (id: number) => void
): ColumnsType<QRCode & { client?: Client }> => [
  {
    title: 'QR Code',
    dataIndex: 'code_value',
    key: 'code_value',
    render: (text: string, record: QRCode & { client?: Client }) => (
      <Space>
        <QrcodeOutlined className="text-2xl text-blue-500" />
        <div>
          <div className="font-mono font-medium">{text}</div>
          <div className="text-sm text-gray-500">
            Client: {record.client?.business_name || 'Unknown'}
          </div>
        </div>
      </Space>
    ),
  },
  {
    title: 'Expiration',
    dataIndex: 'expires_at',
    key: 'expires_at',
    render: (expiresAt: string) => (
      <Tag
        color={expiresAt && dayjs().isAfter(dayjs(expiresAt)) ? 'red' : 'green'}
        icon={<ClockCircleOutlined />}
      >
        {expiresAt ? dayjs(expiresAt).format('MMM D, YYYY') : 'Never expires'}
      </Tag>
    ),
  },
  {
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (date: string) => dayjs(date).format('MMM D, YYYY'),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record: QRCode) => (
      <Space>
        <Button icon={<EyeOutlined />} size="small" onClick={() => onPreview(record)}>
          Preview
        </Button>
        <Button icon={<DownloadOutlined />} size="small" onClick={() => onDownload(record.id)}>
          Download
        </Button>
        <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} />
        <Popconfirm
          title="Delete QR Code"
          description="Are you sure you want to delete this QR code?"
          onConfirm={() => onDelete(record.id)}
        >
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    ),
  },
];
