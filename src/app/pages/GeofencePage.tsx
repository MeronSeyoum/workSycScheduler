'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Avatar, 
  message, 
  Flex, 
  Typography, 
  Drawer, 
  Modal, 
  Card, 
  Tooltip,
  notification,
  Badge
} from 'antd';
import { 
  EnvironmentOutlined,
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '@/components/AuthProvider';
import { api } from '@/lib/api';
// import GeofenceForm from './GeofenceForm';
import { Geofence, Client } from '@/types';
import GeofenceForm from '@/components/form/GeofenceForm';

const { Title, Text } = Typography;
const { useNotification } = notification;

const GeofencePage: React.FC = () => {
  const { token } = useAuth();
  const [api, contextHolder] = notification.useNotification();
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [filteredGeofences, setFilteredGeofences] = useState<Geofence[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentGeofence, setCurrentGeofence] = useState<Geofence | null>(null);

  const showNotification = (type: 'success' | 'error', message: string, description?: string) => {
    api[type]({
      message,
      description,
      icon: type === 'success' ? 
        <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      placement: 'topRight'
    });
  };

  const fetchGeofences = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await api.geofence.fetchAll(token);
      const data: Geofence[] = Array.isArray(response) ? response : response.data || [];
      setGeofences(data);
      setFilteredGeofences(data);
    } catch (error: any) {
      showNotification('error', 'Failed to load geofences', error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchClients = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.clientApi.fetchAll(token);
      const data: Client[] = Array.isArray(response) ? response : response.data || [];
      setClients(data);
    } catch (error: any) {
      console.error('Failed to fetch clients:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchGeofences();
    fetchClients();
  }, [fetchGeofences, fetchClients]);

  useEffect(() => {
    const results = geofences.filter(geofence =>
      geofence.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      geofence.client_id.toString().includes(searchTerm)
    );
    setFilteredGeofences(results);
  }, [searchTerm, geofences]);

  const handleCreate = async (values: Omit<Geofence, 'id'>) => {
    setFormLoading(true);
    try {
      await api.geofence.create(values, token!);
      showNotification('success', 'Geofence created successfully');
      setDrawerVisible(false);
      await fetchGeofences();
    } catch (error: any) {
      showNotification('error', 'Failed to create geofence', error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (values: Geofence) => {
    setFormLoading(true);
    try {
      await api.geofence.update(values.id, values, token!);
      showNotification('success', 'Geofence updated successfully');
      setDrawerVisible(false);
      await fetchGeofences();
    } catch (error: any) {
      showNotification('error', 'Failed to update geofence', error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this geofence?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.geofence.delete(id, token!);
          showNotification('success', 'Geofence deleted successfully');
          await fetchGeofences();
        } catch (error: any) {
          showNotification('error', 'Failed to delete geofence', error.message);
        }
      }
    });
  };

  const columns: ColumnsType<Geofence> = [
    {
      title: 'CLIENT',
      dataIndex: ['client', 'name'],
      key: 'client',
      width: 200,
      render: (_, record) => (
        <Flex align="center" gap={12}>
          <Avatar 
            size={40} 
            icon={<EnvironmentOutlined />}
            style={{ backgroundColor: '#7265e6' }}
          />
          <Text strong>{record.client?.name || `Client ${record.client_id}`}</Text>
        </Flex>
      )
    },
    {
      title: 'LOCATION',
      key: 'location',
      render: (_, record) => (
        <div>
          <Text strong>Lat: {record.latitude.toFixed(6)}</Text>
          <br />
          <Text strong>Lng: {record.longitude.toFixed(6)}</Text>
        </div>
      )
    },
    {
      title: 'RADIUS',
      dataIndex: 'radius_meters',
      key: 'radius',
      render: (radius) => (
        <Tag color="blue">{radius}m</Tag>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setCurrentGeofence(record);
              setDrawerVisible(true);
            }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      <div className="p-6">
        <Card 
          title={
            <Flex justify="space-between" align="center">
              <Title level={4} style={{ margin: 0 }}>Geofence Management</Title>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentGeofence(null);
                  setDrawerVisible(true);
                }}
              >
                Add Geofence
              </Button>
            </Flex>
          }
          bordered={false}
          style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}
        >
          <div style={{ marginBottom: 24 }}>
            <Input
              placeholder="Search geofences..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredGeofences}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 800 }}
          />
        </Card>

        <Drawer
          title={currentGeofence ? 'Edit Geofence' : 'Add Geofence'}
          width={720}
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          destroyOnClose
        >
          <GeofenceForm
            initialValues={currentGeofence || undefined}
            onSubmit={currentGeofence ? handleUpdate : handleCreate}
            loading={formLoading}
            clients={clients}
          />
        </Drawer>
      </div>
    </>
  );
};

export default GeofencePage;