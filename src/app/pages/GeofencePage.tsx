'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Avatar, 
  Drawer, 
  Modal, 
  notification,
} from 'antd';
import { 
  EnvironmentOutlined,
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AimOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { api as apiCall } from '@/lib/api';
import GeofenceForm from '@/components/form/GeofenceForm';
import { useAuth } from '@/components/providers/AuthProvider';
import { Geofence } from '@/lib/types/geofence';
import { Client } from '@/lib/types/client';
import { Skeleton } from '@/components/ui/common/skeleton';

// Simple map component to show location
const SimpleLocationMap = ({ lat, lng, radius }: { lat: number; lng: number; radius: number }) => {
  return (
    <div className="relative w-24 h-24 bg-blue-50 rounded-lg border border-blue-200 overflow-hidden">
      <div 
        className="absolute w-4 h-4 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          left: '50%', 
          top: '50%',
          boxShadow: '0 0 0 2px white, 0 0 0 4px #0F6973'
        }}
      />
      <div 
        className="absolute border-2 border-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ 
          left: '50%', 
          top: '50%',
          width: `${Math.min(radius / 50, 90)}%`,
          height: `${Math.min(radius / 50, 90)}%`,
        }}
      />
      <div className="absolute bottom-1 left-1 text-xs text-blue-700 font-medium">
        {radius}m
      </div>
    </div>
  );
};

const GeofencePage: React.FC = () => {
  const { token } = useAuth();
  const [api, contextHolder] = notification.useNotification();
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [filteredGeofences, setFilteredGeofences] = useState<Geofence[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentGeofence, setCurrentGeofence] = useState<Geofence | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string, description?: string) => {
    api[type]({
      message,
      description,
      icon: type === 'success' ? 
        <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      placement: 'topRight'
    });
  }, [api]);

  const fetchGeofences = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await apiCall.geofence.api.geofence.fetchAll(token);
      setGeofences(data);
      setFilteredGeofences(data);
    } catch (error: any) {
      showNotification('error', 'Failed to load geofences', error.message);
    } finally {
      setLoading(false);
    }
  }, [token, showNotification]);

  const fetchClients = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiCall.clients.fetchClients(token);
      setClients(data);
    } catch (error: any) {
      console.error('Failed to fetch clients:', error);
      showNotification('error', 'Failed to load client data');
    }
  }, [token, showNotification]);

  useEffect(() => {
    fetchGeofences();
    fetchClients();
  }, [fetchGeofences, fetchClients]);

  useEffect(() => {
    const results = geofences.filter(geofence => {
      const clientName = geofence.client?.business_name?.toLowerCase() || '';
      const clientId = geofence.client_id.toString();
      
      return clientName.includes(searchTerm.toLowerCase()) || 
             clientId.includes(searchTerm);
    });
    setFilteredGeofences(results);
  }, [searchTerm, geofences]);

  const handleFormSubmit = useCallback(async (values: { 
  client_id: number; 
  latitude: string | number; 
  longitude: string | number; 
  radius_meters: number; 
}) => {
  if (!token) return;
  
  setFormLoading(true);
  try {
    // Convert latitude and longitude to numbers if they're strings
    const processedValues: Partial<Geofence> = {
      client_id: values.client_id,
      latitude: typeof values.latitude === 'string' ? parseFloat(values.latitude) : values.latitude,
      longitude: typeof values.longitude === 'string' ? parseFloat(values.longitude) : values.longitude,
      radius_meters: values.radius_meters,
    };

    if (currentGeofence) {
      await apiCall.geofence.api.geofence.update(currentGeofence.id, processedValues as Geofence, token);
      showNotification('success', 'Geofence updated successfully');
    } else {
      await apiCall.geofence.api.geofence.create(processedValues as Omit<Geofence, 'id'>, token);
      showNotification('success', 'Geofence created successfully');
    }
    setDrawerVisible(false);
    await fetchGeofences();
  } catch (error: any) {
    const action = currentGeofence ? 'update' : 'create';
    showNotification('error', `Failed to ${action} geofence`, error.message);
  } finally {
    setFormLoading(false);
  }
}, [currentGeofence, token, showNotification, fetchGeofences]);

  const handleDelete = useCallback(async (id: number) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this geofence?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await apiCall.geofence.api.geofence.delete(id, token!);
          showNotification('success', 'Geofence deleted successfully');
          await fetchGeofences();
        } catch (error: any) {
          showNotification('error', 'Failed to delete geofence', error.message);
        }
      }
    });
  }, [token, showNotification, fetchGeofences]);

  const getClientName = useCallback((clientId: number, clientsList: Client[]) => {
    const client = clientsList.find(c => c.id === clientId);
    return client?.business_name || `Client ${clientId}`;
  }, []);

  const columns: ColumnsType<Geofence> = [
    {
      title: 'CLIENT',
      dataIndex: 'client_id',
      key: 'client',
      width: 250,
      render: (clientId, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            size={36} 
            icon={<EnvironmentOutlined />}
            className="bg-teal-700"
          />
          <div>
            <div className="text-sm font-semibold">
              {record.client?.business_name || getClientName(clientId, clients)}
            </div>
            <div className="text-xs text-gray-500">
              ID: {clientId}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'LOCATION',
      key: 'location',
      render: (_, record) => (
        <div className="flex items-center gap-4">
          <SimpleLocationMap 
            lat={record.latitude} 
            lng={record.longitude} 
            radius={record.radius_meters} 
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-xs">
              <AimOutlined className="text-teal-700 text-xs" />
              <span className="font-medium">Lat:</span> 
              <span>{record.latitude}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <AimOutlined className="text-teal-700 text-xs" />
              <span className="font-medium">Lng:</span> 
              <span>{record.longitude}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'RADIUS',
      dataIndex: 'radius_meters',
      key: 'radius',
      align: 'center' as const,
      render: (radius) => (
        <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">
          {radius}m
        </span>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 120,
      align: 'center' as const,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button 
            icon={<EditOutlined />} 
            className="border-teal-700 text-teal-700 hover:border-teal-600 hover:text-teal-600"
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
        </div>
      )
    }
  ];

  return (
    <>
      {contextHolder}
      {loading ? (
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="min-h-screen">
          <div className="py-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <Input
                placeholder="Search clients or IDs..."
                prefix={<SearchOutlined />}
                style={{ width: 280, borderRadius: '8px' }}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
              <Button 
                type="primary"
                style={{ 
                  backgroundColor: '#0F6973', 
                  borderColor: '#0F6973',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}
                icon={<PlusOutlined />}
                onClick={() => {
                  setCurrentGeofence(null);
                  setDrawerVisible(true);
                }}
              >
                Add Geofence
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={filteredGeofences}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
            className="border border-gray-300 rounded-lg overflow-hidden"
            scroll={{ x: 800 }}
            // Customize table styling
         components={{
                header: {
                  cell: (props) => (
                    <th
                      {...props}
                      style={{
                        ...props.style,
                        backgroundColor: "#fafafa",
                        borderBottom: "1px solid #d9d9d9",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "13px",
                        padding: "12px 16px",
                      }}
                    />
                  ),
                },
              }}
            // Add bordered prop and customize cell borders
            bordered
            style={{
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
            }}
          />

          <Drawer
            title={
              <span className="text-teal-700">
                {currentGeofence ? 'Edit Geofence' : 'Add Geofence'}
              </span>
            }
            width={720}
            open={drawerVisible}
            onClose={() => setDrawerVisible(false)}
            styles={{
              body: { padding: "24px 0" },
            }}
          >
            <GeofenceForm
              initialValues={currentGeofence || undefined}
              onSubmit={handleFormSubmit}
              loading={formLoading}
              clients={clients}
            />
          </Drawer>
        </div>
      )}
    </>
  );
};

export default GeofencePage;