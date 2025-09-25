// components/Dashboard/cards/EnhancedGeofenceCard.tsx
import React, { useState } from 'react';
import { Card, Avatar, Badge, Tag, Button, Space, Tooltip, Progress, Dropdown } from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  RadarChartOutlined,
  AimOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Geofence } from '@/lib/types/geofence';
import { Client } from '@/lib/types/client';

interface EnhancedGeofenceCardProps {
  geofence: Geofence;
  onEdit: () => void;
  onDelete: () => void;
  allClients: Client[];
}

export const GeofenceCard: React.FC<EnhancedGeofenceCardProps> = ({
  geofence,
  onEdit,
  onDelete,
  allClients,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getClientName = (clientId: number) => {
    const client = allClients.find((c) => c.id === clientId);
    return client?.business_name || `Client ${clientId}`;
  };

  const getClientInfo = (clientId: number) => {
    const client = allClients.find((c) => c.id === clientId);
    return client;
  };

  const client = getClientInfo(geofence.client_id);
  const coverageArea = Math.round(Math.PI * Math.pow(geofence.radius_meters, 2));

  const menuItems = [
    {
      key: 'edit',
      label: 'Edit Geofence',
      icon: <EditOutlined />,
      onClick: onEdit,
    },
    {
      key: 'view',
      label: 'View Details',
      icon: <EyeOutlined />,
    },
    {
      key: 'analytics',
      label: 'View Analytics',
      icon: <RadarChartOutlined />,
    },
    {
      key: 'map',
      label: 'View on Map',
      icon: <AimOutlined />,
    },
    { type: 'divider' as const },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: onDelete,
    },
  ];

  return (
    <Card
      className="geofence-enhanced-card"
      style={{
        height: '340px',
        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
        border: '1px solid #e8f4f5',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fffe 100%)',
        boxShadow: isHovered
          ? '0 12px 28px rgba(15, 105, 115, 0.12), 0 4px 16px rgba(15, 105, 115, 0.06)'
          : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
      }}
      bodyStyle={{ padding: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                size={36}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: '#0F6973',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(15, 105, 115, 0.3)',
                }}
              />
              <Badge
                dot
                // color={geofence.status === 'active' ? '#52c41a' : '#faad14'}
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  boxShadow: '0 0 0 2px white',
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900 leading-tight">
                {getClientName(geofence.client_id)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {client?.contact_person || 'Unknown contact'}
              </div>
            </div>
          </div>
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </div>
      </div>

      {/* Visual Geofence Section */}
      <div className="relative h-32 bg-gradient-to-br from-cyan-50 to-blue-100 overflow-hidden">
        {/* Animated Background Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(15, 105, 115, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(15, 105, 115, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '25px 25px',
          }}
        />

        {/* Geofence Visualization */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Pulse rings */}
          <div
            className="absolute rounded-full border-2 border-teal-400 opacity-30 animate-ping"
            style={{
              width: `${Math.min(geofence.radius_meters * 0.08, 80)}px`,
              height: `${Math.min(geofence.radius_meters * 0.08, 80)}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animationDuration: '3s',
            }}
          />

          {/* Main geofence circle */}
          <div
            className="relative rounded-full border-4 border-teal-500"
            style={{
              width: `${Math.min(geofence.radius_meters * 0.06, 60)}px`,
              height: `${Math.min(geofence.radius_meters * 0.06, 60)}px`,
              background:
                'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, rgba(20, 184, 166, 0.05) 70%, transparent 100%)',
              transition: 'all 0.3s ease',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              boxShadow: '0 8px 32px rgba(20, 184, 166, 0.3)',
            }}
          >
            {/* Center point */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div
                className="w-3 h-3 bg-teal-600 rounded-full border-2 border-white"
                style={{ boxShadow: '0 2px 8px rgba(20, 184, 166, 0.4)' }}
              />
            </div>
          </div>
        </div>

        {/* Status and Info Badges */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Tag
            // color={geofence.status === 'active' ? 'green' : 'orange'}
            style={{
              fontSize: '10px',
              fontWeight: '600',
              borderRadius: '12px',
              padding: '2px 8px',
              textTransform: 'uppercase',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {/* {geofence.status || 'active'} */}
          </Tag>
        </div>

        <div className="absolute bottom-3 left-3">
          <div
            className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
            style={{
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            {geofence.latitude}, {geofence.longitude}
          </div>
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, rgba(15, 105, 115, 0.9) 0%, rgba(6, 182, 212, 0.8) 100%)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Space size="large">
              <Tooltip title="Edit Geofence">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={onEdit}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: 'white',
                  }}
                />
              </Tooltip>
              <Tooltip title="View Analytics">
                <Button
                  shape="circle"
                  icon={<RadarChartOutlined />}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: 'white',
                  }}
                />
              </Tooltip>
            </Space>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <RadarChartOutlined className="text-teal-600" />
            <span className="text-sm font-medium text-gray-700">Geofence Details</span>
          </div>
          <Tag color="blue" style={{ borderRadius: '8px' }}>
            {geofence.radius_meters}m
          </Tag>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Accuracy:</span>
            <div className="flex items-center gap-2">
              <Progress
                // percent={geofence.accuracy || 95}
                percent={95}
                size="small"
                strokeColor="#0F6973"
                style={{ width: '50px' }}
                showInfo={false}
              />
              <span className="text-xs font-medium">{95}%</span>
              {/* <span className="text-xs font-medium">{geofence.accuracy || 95}%</span> */}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Coverage:</span>
            <span className="text-xs font-medium">
              ~{(coverageArea / 1000000).toFixed(2)} km²
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Created:</span>
            <span className="text-xs text-gray-500">
              {dayjs(geofence.created_at).format('MMM D, YYYY')}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};