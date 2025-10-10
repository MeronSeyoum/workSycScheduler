// components/Dashboard/columns/geofenceColumns.tsx
import React from 'react';
import { Space, Avatar, Tag, Button, Tooltip, Popconfirm, Progress, Row, Col } from 'antd';
import { UserOutlined, EnvironmentOutlined, RadarChartOutlined, EditOutlined, DeleteOutlined, AimOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Geofence } from '@/lib/types/geofence';
import { Client } from '@/lib/types/client';

export const geofenceTableColumns = (
  onEdit: (geofence: Geofence) => void,
  onDelete: (geofence: Geofence) => void,
  onViewOnMap: (geofence: Geofence) => void, // NEW: Added this callback
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
      const area = Math.round(Math.PI * Math.pow(record.radius_meters, 2));
      const areaKm2 = area / 1000000;
      
      return (
        <div className="w-full">
          <Row gutter={[8, 6]} align="top">
            <Col xs={24}>
              <Row gutter={8} align="middle" wrap={false}>
                <Col flex="none">
                  <Avatar icon={<UserOutlined />} size="small" style={{ backgroundColor: '#0F6973' }} />
                </Col>
                <Col flex="auto" style={{ minWidth: 0 }}>
                  <div className="font-medium text-sm truncate">
                    {client?.business_name || `Client ${clientId}`}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {record.radius_meters >= 1000 ? 
                      `${(record.radius_meters / 1000)}km radius` : 
                      `${record.radius_meters}m radius`
                    }
                  </div>
                </Col>
              </Row>
            </Col>
            <Col xs={24}>
              <Row gutter={8} align="middle">
                <Col flex="none">
                  <EnvironmentOutlined className="text-gray-400 text-xs" />
                </Col>
                <Col flex="auto" style={{ minWidth: 0 }}>
                  <div className="text-xs font-mono truncate">
                    {record.latitude}, {record.longitude}
                  </div>
                </Col>
              </Row>
            </Col>
            <Col xs={24}>
              <Row gutter={8} align="middle" justify="space-between">
                {/* <Col>
                  <Tag 
                    size="small"
                    color={record.status === 'active' ? 'green' : record.status === 'inactive' ? 'red' : 'orange'}
                  >
                    {record.status}
                  </Tag>
                </Col> */}
                <Col>
                  <span className="text-xs text-gray-500">
                    {dayjs(record.created_at).format('MMM D')}
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
    width: '22%',
    responsive: ['sm'],
    render: (clientId: number) => {
      const client = clients.find((c) => c.id === clientId);
      return (
        <div className="w-full">
          <Row gutter={[8, 4]} align="middle" wrap={false}>
            <Col flex="none">
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0F6973' }} />
            </Col>
            <Col flex="auto" style={{ minWidth: 0 }}>
              <div className="font-medium truncate" title={client?.business_name || `Client ${clientId}`}>
                {client?.business_name || `Client ${clientId}`}
              </div>
              <div className="text-sm text-gray-500 truncate" title={client?.contact_person || 'N/A'}>
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
    width: '20%',
    responsive: ['sm'],
    render: (latitude: number, record: Geofence) => (
      <div className="w-full">
        <Row gutter={[6, 4]} align="middle" wrap={false}>
          <Col flex="none">
            <EnvironmentOutlined className="text-gray-400" />
          </Col>
          <Col flex="auto" style={{ minWidth: 0 }}>
            <div className="font-mono text-xs truncate" title={`${latitude}, ${record.longitude}`}>
              {latitude} {record.longitude}
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
    width: '10%',
    responsive: ['sm'],
    render: (radius: number) => (
      <div className="w-full text-center">
        <Tag color="blue" icon={<RadarChartOutlined />} className="whitespace-nowrap">
          {radius >= 1000 ? `${(radius / 1000)}km` : `${radius}m`}
        </Tag>
      </div>
    ),
    sorter: (a, b) => a.radius_meters - b.radius_meters,
  },
  {
    title: 'Coverage',
    key: 'coverage',
    width: '15%',
    responsive: ['md'],
    render: (_, record: Geofence) => {
      const area = Math.round(Math.PI * Math.pow(record.radius_meters, 2));
      const areaKm2 = area / 1000000;
      
      return (
        <Tooltip title={`Approximate coverage area: ${area.toLocaleString()} m²`}>
          <div className="w-full">
            <Progress
              percent={Math.min((record.radius_meters / 5000) * 100, 100)}
              size="small"
              strokeColor="#0F6973"
              showInfo={false}
            />
            <div className="text-xs text-gray-500 mt-1 truncate">
              {areaKm2 >= 1 ? `${areaKm2} km²` : `${area.toLocaleString()} m²`}
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
    width: '8%',
    responsive: ['sm'],
    render: (status: string) => (
      <div className="w-full text-center">
        <Tag
          color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange'}
          className="capitalize whitespace-nowrap"
        >
          {status}
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
        <div className="text-sm whitespace-nowrap">{dayjs(date).format('MMM D, YYYY')}</div>
        <div className="text-xs text-gray-500 whitespace-nowrap">{dayjs(date).format('h:mm A')}</div>
      </div>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: '5%',
    responsive: ['sm'],
    render: (_, record: Geofence) => (
      <div className="w-full">
        <Row gutter={[6, 6]} justify="end" wrap={false}>
          <Col>
            <Tooltip title="Edit Geofence">
              <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(record)} />
            </Tooltip>
          </Col>
          
           <Col>
  <Tooltip title="View on Map">
    <Button 
      icon={<AimOutlined />} 
      size="small" 
      onClick={() => onViewOnMap(record)} // ADDED: onClick handler
    />
  </Tooltip>

          </Col>
          <Col>
            <Popconfirm
              title="Delete Geofence"
              description="Are you sure you want to delete this geofence?"
              onConfirm={() => onDelete(record)}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Delete Geofence">
                <Button icon={<DeleteOutlined />} size="small" danger />
              </Tooltip>
            </Popconfirm>
          </Col>
        </Row>
      </div>
    ),
  },
];