
// components/Dashboard/columns/geofenceColumns.tsx
import React from 'react';
import { Space, Avatar, Tag, Button, Tooltip, Popconfirm, Progress } from 'antd';
import { UserOutlined, EnvironmentOutlined, RadarChartOutlined, EditOutlined, DeleteOutlined, AimOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Geofence } from '@/lib/types/geofence';
import { Client } from '@/lib/types/client';

export const geofenceTableColumns = (
  onEdit: (geofence: Geofence) => void,
  onDelete: (geofence: Geofence) => void,
  clients: Client[]
): ColumnsType<Geofence> => [
  {
    title: 'Client',
    dataIndex: 'client_id',
    key: 'client',
    render: (clientId: number) => {
      const client = clients.find((c) => c.id === clientId);
      return (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0F6973' }} />
          <div>
            <div className="font-medium">{client?.business_name || `Client ${clientId}`}</div>
            <div className="text-sm text-gray-500">{client?.contact_person || 'N/A'}</div>
          </div>
        </Space>
      );
    },
  },
  {
    title: 'Location Coordinates',
    dataIndex: 'latitude',
    key: 'coordinates',
    render: (latitude: number, record: Geofence) => (
      <Space>
        <EnvironmentOutlined className="text-gray-400" />
        <span className="font-mono text-sm">{latitude}, {record.longitude}</span>
      </Space>
    ),
  },
  {
    title: 'Radius',
    dataIndex: 'radius_meters',
    key: 'radius',
    render: (radius: number) => (
      <Tag color="blue" icon={<RadarChartOutlined />}>
        {radius}m
      </Tag>
    ),
    sorter: (a, b) => a.radius_meters - b.radius_meters,
  },
  {
    title: 'Coverage Area',
    key: 'coverage',
    render: (_, record: Geofence) => {
      const area = Math.round(Math.PI * Math.pow(record.radius_meters, 2));
      return (
        <Tooltip title={`Approximate coverage area: ${area.toLocaleString()} m²`}>
          <Progress
            percent={Math.min((record.radius_meters / 5000) * 100, 100)}
            size="small"
            strokeColor="#0F6973"
            showInfo={false}
          />
          <div className="text-xs text-gray-500 mt-1">~{(area / 1000000).toFixed(2)} km²</div>
        </Tooltip>
      );
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag
        color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange'}
        className="capitalize"
      >
        {status}
      </Tag>
    ),
  },
  {
    title: 'Created Date',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (date: string) => (
      <div>
        <div>{dayjs(date).format('MMM D, YYYY')}</div>
        <div className="text-xs text-gray-500">{dayjs(date).format('h:mm A')}</div>
      </div>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record: Geofence) => (
      <Space>
        <Tooltip title="Edit Geofence">
          <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} />
        </Tooltip>
        <Tooltip title="View Analytics">
          <Button icon={<RadarChartOutlined />} size="small" />
        </Tooltip>
        <Tooltip title="View on Map">
          <Button icon={<AimOutlined />} size="small" />
        </Tooltip>
        <Popconfirm
          title="Delete Geofence"
          description="Are you sure you want to delete this geofence? This action cannot be undone."
          onConfirm={() => onDelete(record)}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete Geofence">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
  },
];

