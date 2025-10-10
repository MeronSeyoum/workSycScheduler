// components/Dashboard/columns/qrCodeColumns.tsx
import React from 'react';
import { Space, Tag, Button, Popconfirm, Row, Col } from 'antd';
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
    width: '50%',
    responsive: ['md'],
    render: (text: string, record: QRCode & { client?: Client }) => (
      <div className="w-full">
        <Row gutter={[8, 8]} align="middle" wrap={false}>
          <Col flex="none">
            <QrcodeOutlined className="text-3xl text-blue-500" />
          </Col>
          <Col flex="auto" style={{ minWidth: 0 }}> {/* minWidth: 0 allows text truncation */}
            <div className=" text-base font-medium truncate text-teal-700" title={record.client?.business_name || 'Unknown'}>
              {record.client?.business_name || 'Unknown'}
            </div>
            <div className="font-mono text-sm text-gray-500 truncate" title={text}>
              {text}
            </div>
          </Col>
        </Row>
      </div>
    ),
  },
  {
    title: 'Expiration',
    dataIndex: 'expires_at',
    key: 'expires_at',
    width: '15%',
    responsive: ['md'],
    render: (expiresAt: string) => (
      <div className=" w-full py-2">
        <Tag
          color={expiresAt && dayjs().isAfter(dayjs(expiresAt)) ? 'red' : 'green'}
          icon={<ClockCircleOutlined />}
          className="w-full justify-center "
        >
            {expiresAt ? dayjs(expiresAt).format('MMM D, YYYY') : 'Never expires'}
        </Tag>
      </div>
    ),
  },
  {
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    width: '15%',
    responsive: ['lg'],
    render: (date: string) => (
      <div className="w-full">
        <span className="text-sm whitespace-nowrap">
          {dayjs(date).format('MMM D, YYYY')}
        </span>
      </div>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: '10%',
    responsive: ['sm'],
    render: (_, record: QRCode) => (
      <div className="w-full">
        <Row gutter={[8, 8]} justify="end" wrap={false}>
          <Col>
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => onPreview(record)}
              className="whitespace-nowrap"
            >
              <span className="hidden sm:inline">Preview</span>
            </Button>
          </Col>
          <Col>
            <Button 
              icon={<DownloadOutlined />} 
              size="small" 
              onClick={() => onDownload(record.id)}
              className="whitespace-nowrap"
            >
              <span className="hidden sm:inline">Download</span>
            </Button>
          </Col>
          <Col>
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => onEdit(record)}
            />
          </Col>
          <Col>
            <Popconfirm
              title="Delete QR Code"
              description="Are you sure you want to delete this QR code?"
              onConfirm={() => onDelete(record.id)}
            >
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger 
              />
            </Popconfirm>
          </Col>
        </Row>
      </div>
    ),
  },
];