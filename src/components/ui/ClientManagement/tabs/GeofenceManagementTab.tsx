// components/Dashboard/tabs/GeofenceManagementTab.tsx
import React, { useState } from 'react';
import { Card, Button, Space, Segmented, Table, Row, Col } from 'antd';
import { PlusOutlined, AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { Geofence } from '@/lib/types/geofence';
import { Client } from '@/lib/types/client';
import { GeofenceModal } from '../modals/GeofenceModal';
import { GeofenceCard } from '../cards/GeofenceCard';
import { geofenceTableColumns } from '../columns/geofenceColumns';
import { VIEW_MODES } from '@/lib/constants/clientDashboard';
import { GeofenceForm } from '../forms/GeofenceForm';

interface GeofenceManagementTabProps {
  geofences: Geofence[];
  geofenceData: any;
  clients: Client[];
  showNotification: (type: 'success' | 'error' | 'info', message: string, description: string) => void;
}

export const GeofenceManagementTab: React.FC<GeofenceManagementTabProps> = ({
  geofences,
  geofenceData,
  clients,
  showNotification,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleGeofenceSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      const isUpdate = !!values.id;

      // Validate required fields
      if (!values.client_id || !values.latitude || !values.longitude || !values.radius_meters) {
        throw new Error('All required fields must be filled');
      }

      const processedValues = {
        client_id: values.client_id,
        latitude: parseFloat(values.latitude.toString()),
        longitude: parseFloat(values.longitude.toString()),
        radius_meters: parseInt(values.radius_meters.toString()),
        // accuracy: values.accuracy || 95,
        // status: values.status || 'active',
      };

      if (isUpdate) {
        const { id, ...updateData } = values;
        await geofenceData.updateGeofence(id, updateData);
        showNotification('success', '', 'Geofence updated successfully');
      } else {
        await geofenceData.createGeofence(processedValues);
        showNotification('success', '', 'Geofence created successfully');
      }

      setModalVisible(false);
      setSelectedGeofence(null);
    } catch (error: any) {
      const action = values.id ? 'update' : 'create';
      showNotification('error', `Failed to ${action} geofence`, error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (geofence: Geofence) => {
    setSelectedGeofence(geofence);
    setModalVisible(true);
  };

  const handleDelete = async (geofence: Geofence) => {
    try {
      await geofenceData.deleteGeofence(geofence.id);
      showNotification('success', '', 'Geofence deleted successfully');
    } catch (error: any) {
      showNotification('error', 'Failed to delete geofence', error.message);
    }
  };

  const columns = geofenceTableColumns(handleEdit, handleDelete, clients);

  return (
    <Card
      title="Geofence Management"
      extra={
        <Space>
          <Segmented
            options={[
              { label: 'Grid View', value: VIEW_MODES.CARD, icon: <AppstoreOutlined /> },
              { label: 'Table View', value: VIEW_MODES.TABLE, icon: <BarsOutlined /> },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedGeofence(null);
              setModalVisible(true);
            }}
            style={{ backgroundColor: '#0F6973', borderColor: '#0F6973' }}
            loading={formLoading}
          >
            Create Geofence
          </Button>
        </Space>
      }
    >
      {viewMode === VIEW_MODES.TABLE ? (
        <Table
          columns={columns}
          dataSource={geofences}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} geofences`,
          }}
          loading={geofenceData.loading}
          scroll={{ x: 1000 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {geofences.map((geofence) => (
            <Col span={8} key={geofence.id}>
              <GeofenceCard
                geofence={geofence}
                allClients={clients}
                onEdit={() => handleEdit(geofence)}
                onDelete={() => handleDelete(geofence)}
              />
            </Col>
          ))}
        </Row>
      )}

      <GeofenceModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedGeofence(null);
        }}
        title={selectedGeofence ? 'Edit Geofence' : 'Create New Geofence'}
      >
        <GeofenceForm
          initialValues={selectedGeofence || undefined}
          onSubmit={handleGeofenceSubmit}
          loading={formLoading}
          clients={clients}
        />
      </GeofenceModal>
    </Card>
  );
};