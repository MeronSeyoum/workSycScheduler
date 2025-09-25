// components/Dashboard/tabs/QRCodeManagementTab.tsx
import React, { useState } from 'react';
import { Card, Button, Table, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { QRCode } from '@/lib/types/qrcode';
import { Client } from '@/lib/types/client';
import { QRCodeForm } from '../forms/QRCodeForm';
import { QRCodeDrawer } from '../modals/QRCodeDrawer';
import { QRCodePreviewModal } from '../modals/QRCodePreviewModal';
import { qrCodeTableColumns } from '../columns/qrCodeColumns';

interface QRCodeManagementTabProps {
  qrCodes: (QRCode & { client?: Client })[];
  qrCodeData: any;
  clients: Client[];
  showNotification: (type: 'success' | 'error' | 'info', message: string, description: string) => void;
}

export const QRCodeManagementTab: React.FC<QRCodeManagementTabProps> = ({
  qrCodes,
  qrCodeData,
  clients,
  showNotification,
}) => {
  const [selectedQrCode, setSelectedQrCode] = useState<QRCode | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewQrCode, setPreviewQrCode] = useState<QRCode | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleQrCodeSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      const isUpdate = !!selectedQrCode?.id;

      if (isUpdate) {
        await qrCodeData.updateQRCode(selectedQrCode.id, { expires_at: values.expires_at });
        showNotification('success', '', 'QR Code updated successfully');
      } else {
        await qrCodeData.createQRCode({
          client_id: values.client_id,
          expires_at: values.expires_at,
        });
        showNotification('success', '', 'QR Code created successfully');
      }

      setModalVisible(false);
      setSelectedQrCode(null);
    } catch (error: any) {
      const action = selectedQrCode ? 'update' : 'create';
      showNotification('error', `Failed to ${action} QR Code`, error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handlePreview = (qrCode: QRCode) => {
    setPreviewQrCode(qrCode);
    setPreviewVisible(true);
  };

  const handleDownload = async (id: number) => {
    try {
      const blob = await qrCodeData.downloadQRCode(id);
      const qrCode = qrCodes.find((q) => q.id === id);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${qrCode?.code_value}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showNotification('success', '', 'QR code downloaded successfully');
    } catch (error: any) {
      showNotification('error', 'Failed to download QR Code', error.message);
    }
  };

  const handleEdit = (qrCode: QRCode) => {
    setSelectedQrCode(qrCode);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await qrCodeData.deleteQRCode(id);
      showNotification('success', '', 'QR Code deleted successfully');
    } catch (error: any) {
      showNotification('error', 'Failed to delete QR Code', error.message);
    }
  };

  const columns = qrCodeTableColumns(handlePreview, handleDownload, handleEdit, handleDelete);

  return (
    <Card
      title="QR Code Management"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedQrCode(null);
            setModalVisible(true);
          }}
          style={{ backgroundColor: '#0F6973', borderColor: '#0F6973' }}
          loading={formLoading}
        >
          Generate QR Code
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={qrCodes}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={qrCodeData.loading}
      />

      <QRCodeDrawer
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedQrCode(null);
        }}
        title={selectedQrCode ? 'Edit QR Code' : 'Generate QR Code'}
      >
        <QRCodeForm
          initialValues={selectedQrCode || undefined}
          onSubmit={handleQrCodeSubmit}
          loading={formLoading}
          clients={clients}
        />
      </QRCodeDrawer>

      <QRCodePreviewModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        qrCode={previewQrCode}
        onDownload={() => previewQrCode && handleDownload(previewQrCode.id)}
      />
    </Card>
  );
};

