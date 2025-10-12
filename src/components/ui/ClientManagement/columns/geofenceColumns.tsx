// components/Dashboard/columns/geofenceColumns.tsx
import React from 'react';
import { Space, Avatar, Tag, Button, Tooltip, Popconfirm, Progress, Row, Col, Badge } from 'antd';
import {
  UserOutlined,
  EnvironmentOutlined,
  RadarChartOutlined,
  EditOutlined,
  DeleteOutlined,
  AimOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Geofence } from '@/lib/types/geofence';
import { Client } from '@/lib/types/client';

dayjs.extend(relativeTime);

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircleOutlined />;
    case 'inactive':
      return <StopOutlined />;
    case 'pending':
      return <ClockCircleOutlined />;
    default:
      return null;
  }
};

const formatRadius = (radius: number): string => {
  return radius >= 1000 ? `${(radius / 1000)}km` : `${radius}m`;
};

const calculateArea = (radiusMeters: number) => {
  const area = Math.round(Math.PI * Math.pow(radiusMeters, 2));
  const areaKm2 = area / 1000000;
  return { area, areaKm2 };
};

export const geofenceTableColumns = (
  onEdit: (geofence: Geofence) => void,
  onDelete: (geofence: Geofence) => void,
  onViewOnMap: (geofence: Geofence) => void,
  clients: Client[]
): ColumnsType<Geofence> => [
  {
    title: 'Geofence Details',
    dataIndex: 'client_id',
    key: 'mobile_view',
    width: '60%',
    responsive: ['xs'],
    render: (clientId: number, record: Geofence) => {
      const client = clients.find((c) => c.id === clientId);
      const { area, areaKm2 } = calculateArea(record.radius_meters);

      return (
        <div className="py-2">
          <Row gutter={[8, 12]} align="top">
            {/* Business & Radius */}
            <Col xs={24}>
              <Row gutter={[12, 4]} align="middle" wrap={false}>
                <Col flex="none">
                  <div className="p-2 bg-teal-50 rounded-lg">
                    <UserOutlined className="text-lg text-teal-600" />
                  </div>
                </Col>
                <Col flex="auto" style={{ minWidth: 0 }}>
                  <div className="font-semibold text-gray-900 truncate">
                    {client?.business_name || `Client ${clientId}`}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <RadarChartOutlined className="text-blue-600" />
                    <span>{formatRadius(record.radius_meters)}</span>
                  </div>
                </Col>
              </Row>
            </Col>

            {/* Coordinates */}
            <Col xs={24}>
              <Row gutter={[8, 4]} align="middle" wrap={false}>
                <Col flex="none">
                  <EnvironmentOutlined className="text-blue-600 text-lg flex-shrink-0" />
                </Col>
                <Col flex="auto" style={{ minWidth: 0 }}>
                  <div className="text-xs font-mono text-gray-700 truncate">
                    {record.latitude}, {record.longitude}
                  </div>
                </Col>
              </Row>
            </Col>

            {/* Status & Created Date */}
            <Col xs={24}>
              <Row gutter={[8, 4]} align="middle" justify="space-between">
                <Col flex="auto">
                  {/* <Tag
                    icon={getStatusIcon(record.status)}
                    color={record.status === 'active' ? 'success' : record.status === 'inactive' ? 'error' : 'warning'}
                    className="font-medium"
                    style={{ textTransform: 'capitalize', border: 'none', margin: 0 }}
                  >
                    {record.status}
                  </Tag> */}
                </Col>
                <Col flex="none">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {dayjs(record.created_at).fromNow()}
                  </span>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      );
    },
  },
  {
    title: 'Client',
    dataIndex: 'client_id',
    key: 'client',
    width: '20%',
    responsive: ['sm'],
    render: (clientId: number) => {
      const client = clients.find((c) => c.id === clientId);
      return (
        <div className="py-2">
          <Row gutter={[12, 4]} align="middle" wrap={false}>
            <Col flex="none">
              <Avatar
                size={36}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#009688' }}
              />
            </Col>
            <Col flex="auto" style={{ minWidth: 0 }}>
              <div className="font-semibold text-gray-900 truncate" title={client?.business_name || `Client ${clientId}`}>
                {client?.business_name || `Client ${clientId}`}
              </div>
              <div className="text-xs text-gray-500 truncate" title={client?.contact_person || 'N/A'}>
                {client?.contact_person || 'N/A'}
              </div>
            </Col>
          </Row>
        </div>
      );
    },
  },
  {
    title: 'Location',
    dataIndex: 'latitude',
    key: 'coordinates',
    width: '18%',
    responsive: ['sm'],
    render: (latitude: number, record: Geofence) => (
      <div className="py-2">
        <Row gutter={[8, 4]} align="middle" wrap={false}>
          <Col flex="none">
            <EnvironmentOutlined className="text-blue-600 flex-shrink-0" />
          </Col>
          <Col flex="auto" style={{ minWidth: 0 }}>
            <div
              className="font-mono text-xs text-gray-700 truncate"
              title={`${latitude}, ${record.longitude}`}
            >
              {latitude}, {record.longitude}
            </div>
          </Col>
        </Row>
      </div>
    ),
  },
  {
    title: 'Radius',
    dataIndex: 'radius_meters',
    key: 'radius',
    width: '12%',
    responsive: ['sm'],
    align: 'center' as const,
    render: (radius: number) => (
      <Tag
        icon={<RadarChartOutlined />}
        color="blue"
        className="font-medium"
        style={{ textTransform: 'none', border: 'none', margin: 0 }}
      >
        {formatRadius(radius)}
      </Tag>
    ),
    sorter: (a, b) => a.radius_meters - b.radius_meters,
  },
  {
    title: 'Coverage',
    key: 'coverage',
    width: '15%',
    responsive: ['md'],
    render: (_, record: Geofence) => {
      const { area, areaKm2 } = calculateArea(record.radius_meters);
      const coverageLabel = areaKm2 >= 1 ? `${areaKm2} km²` : `${area.toLocaleString()} m²`;

      return (
        <Tooltip title={`Coverage area: ${area.toLocaleString()} m² (${coverageLabel})`}>
          <div className="py-2">
            <Progress
              percent={Math.min((record.radius_meters / 5000) * 100, 100)}
              size="small"
              strokeColor="#009688"
              showInfo={false}
            />
            <div className="text-xs text-gray-600 mt-2 font-medium text-center">
              {coverageLabel}
            </div>
          </div>
        </Tooltip>
      );
    },
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '10%',
    responsive: ['sm'],
    align: 'center' as const,
    render: (status: string) => (
      <Tag
        icon={getStatusIcon(status)}
        color={status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning'}
        className="font-medium"
        style={{
          textTransform: 'capitalize',
          border: 'none',
          margin: 0,
        }}
      >
        {status}
      </Tag>
    ),
  },
  {
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    width: '15%',
    responsive: ['lg'],
    render: (created_at: string) => (
      <div className="py-2">
        <div className="text-sm font-medium text-gray-900">
          {dayjs(created_at).format('MMM D, YYYY')}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {dayjs(created_at).fromNow()}
        </div>
      </div>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: '10%',
    responsive: ['sm'],
    align: 'right' as const,
    render: (_, record: Geofence) => (
      <Space size="small" wrap>
        {/* Edit */}
        <Tooltip title="Edit Geofence" placement="top">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="hover:!bg-orange-50 !text-orange-600"
          />
        </Tooltip>

        {/* View on Map */}
        <Tooltip title="View on Map" placement="top">
          <Button
            type="text"
            size="small"
            icon={<AimOutlined />}
            onClick={() => onViewOnMap(record)}
            className="hover:!bg-green-50 !text-green-600"
          />
        </Tooltip>

        {/* Delete */}
        <Popconfirm
          title="Delete Geofence"
          description="This action cannot be undone. The geofence will be permanently removed."
          onConfirm={() => onDelete(record)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{
            danger: true,
          }}
          cancelButtonProps={{
            type: 'default',
          }}
        >
          <Tooltip title="Delete Geofence" placement="top">
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