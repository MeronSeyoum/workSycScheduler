// components/Dashboard/tabs/ClientManagementTab.tsx
import React, { useState } from 'react';
import { Card, Button, Space, Segmented, Table, Row, Col, Avatar, Tag } from 'antd';
import { PlusOutlined, BarsOutlined, AppstoreOutlined, UserOutlined } from '@ant-design/icons';
import { Client } from '@/lib/types/client';
import { ClientForm } from '../forms/ClientForm';
import { ClientDrawer } from '../modals/ClientDrawer';
import { clientTableColumns } from '../columns/clientColumns';
import { CLIENT_STATUS_COLOR_MAP, VIEW_MODES } from '@/lib/constants/clientDashboard';

interface ClientManagementTabProps {
  clients: Client[];
  clientData: any;
  showNotification: (type: 'success' | 'error' | 'info', message: string, description: string) => void;
}

export const ClientManagementTab: React.FC<ClientManagementTabProps> = ({
  clients,
  clientData,
  showNotification,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleClientSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      const isUpdate = !!values.id;
      if (isUpdate) {
        const { id, ...updateData } = values;
        await clientData.updateClient(id, updateData);
        showNotification('success', 'Client Updated', `${values.business_name} updated successfully`);
      } else {
        await clientData.createClient(values);
        showNotification('success', 'Client Created', `${values.business_name} added successfully`);
      }

      setModalVisible(false);
      setSelectedClient(null);
    } catch (error: any) {
      const action = values.id ? 'update' : 'create';
      showNotification('error', `Failed to ${action} client`, error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setModalVisible(true);
  };

  const handleDelete = async (client: Client) => {
    try {
      await clientData.deleteClient(client.id);
      showNotification('success', 'Client Deleted', `${client.business_name} was removed`);
    } catch (error: any) {
      showNotification('error', 'Deletion Failed', error.message);
    }
  };

  const columns = clientTableColumns(handleEdit, handleDelete);

  return (
    <Card
      title="Client Management"
      extra={
        <Space>
          <Segmented
            options={[
              { label: 'Table View', value: VIEW_MODES.TABLE, icon: <BarsOutlined /> },
              { label: 'Card View', value: VIEW_MODES.CARD, icon: <AppstoreOutlined /> },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedClient(null);
              setModalVisible(true);
            }}
            style={{ backgroundColor: '#0F6973', borderColor: '#0F6973' }}
            loading={formLoading}
          >
            Add Client
          </Button>
        </Space>
      }
    >
      {viewMode === VIEW_MODES.TABLE ? (
        <Table
          columns={columns}
          dataSource={clients}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={clientData.loading}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {clients.map((client) => (
            <Col span={8} key={client.id}>
              <Card hoverable>
                <div className="flex items-center gap-3">
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#0F6973' }} />
                  <div>
                    <div className="font-medium">{client.business_name}</div>
                    <div className="text-sm text-gray-600">{client.contact_person}</div>
                    <Tag color={CLIENT_STATUS_COLOR_MAP[client.status]} className="capitalize mt-1">
                      {client.status}
                    </Tag>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <ClientDrawer
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedClient(null);
        }}
        title={selectedClient ? 'Edit Client' : 'Add New Client'}
      >
        <ClientForm
          initialValues={selectedClient || undefined}
          onSubmit={handleClientSubmit}
          loading={formLoading}
        />
      </ClientDrawer>
    </Card>
  );
};

