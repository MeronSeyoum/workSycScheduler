import React from 'react';
import { 
  Modal, 
  Typography, 
  Tag, 
  Divider,
  Card,
  Row,
  Col,
  Avatar,
  Button,
  Space,
  Descriptions
} from 'antd';
import { 
  QrcodeOutlined,
  DownloadOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  MailOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { QRCode } from '@/lib/types/qrcode';
import { Client } from '@/lib/types/client';

const { Title } = Typography;

interface QRCodePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  qrCode: QRCode | null;
  onDownload: () => void;
   client: Client;
}

const QRCodePreviewModal: React.FC<QRCodePreviewModalProps> = ({ 
  visible, 
  onClose, 
  qrCode,
  onDownload 
}) => {
  const isExpired = qrCode?.expires_at && dayjs().isAfter(dayjs(qrCode.expires_at));
  const statusColor = isExpired ? 'red' : 'green';
  const statusText = isExpired ? 'Expired' : 'Active';
  const statusIcon = isExpired ? <ClockCircleOutlined /> : <CheckCircleOutlined />;

  return (
    <Modal
      title="QR Code Details"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      closeIcon={<CloseOutlined />}
    >
      <Card bordered={false}>
        <Row gutter={[16, 16]}>
          {/* QR Code Display */}
          <Col span={24} style={{ textAlign: 'center' }}>
            <Avatar 
              size={160} 
              icon={<QrcodeOutlined />}
              style={{ 
                backgroundColor: '#f0f2f5',
                color: '#722ed1',
                fontSize: 80,
                marginBottom: 16
              }}
            />
            <Title level={3} style={{ marginBottom: 8 }}>
              {qrCode?.code_value || 'N/A'}
            </Title>
            <Tag 
              color={statusColor} 
              icon={statusIcon}
              style={{ fontSize: 14, padding: '4px 8px' }}
            >
              {statusText}
            </Tag>
          </Col>

          {/* QR Code Details */}
          <Col span={24}>
            <Divider orientation="left">QR Code Information</Divider>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Expiration Date">
                {qrCode?.expires_at ? 
                  dayjs(qrCode.expires_at).format('MMMM D, YYYY h:mm A') : 
                  <Tag color="blue">Never expires</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Created Date">
                {dayjs(qrCode?.created_at).format('MMMM D, YYYY h:mm A')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {dayjs(qrCode?.updated_at).format('MMMM D, YYYY h:mm A')}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          {/* Client Details */}
          {qrCode?.client && (
            <Col span={24}>
              <Divider orientation="left">Client Information</Divider>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label={<><ShopOutlined /> Business Name</>}>
                  {qrCode.client.business_name}
                </Descriptions.Item>
                <Descriptions.Item label={<><UserOutlined /> Contact Person</>}>
                  {qrCode.client.contact_person}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                  {qrCode.client.email}
                </Descriptions.Item>
                {qrCode.client.location_address && (
                  <>
                    <Descriptions.Item label="Address">
                      {qrCode.client.location_address.street}
                    </Descriptions.Item>
                    <Descriptions.Item label="City">
                      {qrCode.client.location_address.city}
                    </Descriptions.Item>
                    <Descriptions.Item label="State/Province">
                      {qrCode.client.location_address.state}
                    </Descriptions.Item>
                    <Descriptions.Item label="Postal Code">
                      {qrCode.client.location_address.postal_code}
                    </Descriptions.Item>
                    <Descriptions.Item label="Country">
                      {qrCode.client.location_address.country}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Col>
          )}

          {/* Action Buttons */}
          <Col span={24}>
            <Divider />
            <Space size="middle" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                icon={<DownloadOutlined />} 
                type="primary"
                onClick={onDownload}
                size="large"
              >
                Download QR Code
              </Button>
              <Button onClick={onClose} size="large">
                Close
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </Modal>
  );
};

export default QRCodePreviewModal;