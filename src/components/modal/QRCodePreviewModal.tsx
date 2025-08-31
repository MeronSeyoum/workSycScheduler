import React from 'react';
import { Modal, Image, Typography, Space, Tag, Button, Card, Divider, Descriptions } from 'antd';
import { QrcodeOutlined, DownloadOutlined, ClockCircleOutlined, UserOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { QRCode } from '@/lib/types/qrcode';

const { Title, Text } = Typography;

interface QRCodePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  qrCode: QRCode | null;
  onDownload?: () => void;
}

const QRCodePreviewModal: React.FC<QRCodePreviewModalProps> = ({
  visible,
  onClose,
  qrCode,
  onDownload,
}) => {
  if (!qrCode) return null;

  const isExpired = qrCode.expires_at && dayjs().isAfter(dayjs(qrCode.expires_at));
  const address = qrCode.client?.location_address;

  return (
    <Modal
      title={
        <Space>
          <QrcodeOutlined />
          <span>QR Code Details</span>
          <Tag color={isExpired ? 'red' : 'green'} icon={<ClockCircleOutlined />}>
            {isExpired ? 'Expired' : 'Active'}
          </Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button 
          key="download" 
          icon={<DownloadOutlined />} 
          type="primary" 
          onClick={onDownload}
        >
          Download QR Code
        </Button>,
      ]}
      width={700}
    >
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        <Card 
          style={{ width: 240, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}
        >
          <Image
            width={180}
            src={ `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode.code_value}`}
            alt={qrCode.code_value}
            preview={false}
          />
          <Text strong style={{ marginTop: 16 }}>{qrCode.code_value}</Text>
        </Card>

        <div style={{ flex: 1 }}>
          <Title level={5} style={{ marginBottom: 16 }}>
            <UserOutlined /> Client Information
          </Title>
          
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Business Name">
              <Text strong>{qrCode.client?.business_name || 'N/A'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Contact Person">
              {qrCode.client?.contact_person || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<MailOutlined />}>
              {qrCode.client?.email || 'N/A'}
            </Descriptions.Item>
          </Descriptions>

          {address && (
            <>
              <Divider orientation="left" style={{ margin: '16px 0' }}>
                <EnvironmentOutlined /> Location
              </Divider>
              <div>
                <Text>{address.street}</Text><br />
                <Text>{address.city}, {address.state} {address.postal_code}</Text><br />
                <Text>{address.country}</Text>
              </div>
            </>
          )}
        </div>
      </div>

      <Divider />

      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Created Date">
          {dayjs(qrCode.created_at).format('MMMM D, YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Expiration Date">
          {qrCode.expires_at ? (
            <Text type={isExpired ? "danger" : "success"}>
              {dayjs(qrCode.expires_at).format('MMMM D, YYYY h:mm A')}
            </Text>
          ) : (
            <Text type="success">Never expires</Text>
          )}
        </Descriptions.Item>
       
      </Descriptions>
    </Modal>
  );
};

export default QRCodePreviewModal;