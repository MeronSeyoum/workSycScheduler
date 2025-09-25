// components/Dashboard/modals/QRCodePreviewModal.tsx
import React from 'react';
import { Modal, Space, Tag, Button, Image, Descriptions, Divider } from 'antd';
import { QrcodeOutlined, ClockCircleOutlined, DownloadOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import { QRCode } from '@/lib/types/qrcode';

const { Text } = Typography;

interface QRCodePreviewModalProps {
  visible: boolean;
  onClose: () => void;
  qrCode: QRCode | null;
  onDownload: () => void;
}

export const QRCodePreviewModal: React.FC<QRCodePreviewModalProps> = ({
  visible,
  onClose,
  qrCode,
  onDownload,
}) => {
  if (!qrCode) return null;

  const isExpired =
    qrCode.expires_at && dayjs().isAfter(dayjs(qrCode.expires_at));

  return (
    <Modal
      title={
        <Space>
          <QrcodeOutlined />
          <span>QR Code Details</span>
          <Tag
            color={isExpired ? "red" : "green"}
            icon={<ClockCircleOutlined />}
          >
            {isExpired ? "Expired" : "Active"}
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
      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <div
          style={{
            width: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Image
            width={180}
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCode.code_value}`}
            alt={qrCode.code_value}
            preview={false}
          />
          <Text strong style={{ marginTop: 16 }}>
            {qrCode.code_value}
          </Text>
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{ marginBottom: 16 }}>
            <UserOutlined /> Client Information
          </h4>

          <Descriptions column={1} size="small">
            <Descriptions.Item label="Business Name">
              <Text strong>{qrCode.client?.business_name || "N/A"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Contact Person">
              {qrCode.client?.contact_person || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label={<MailOutlined />}>
              {qrCode.client?.email || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      <Divider />

      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Created Date">
          {dayjs(qrCode.created_at).format("MMMM D, YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Expiration Date">
          {qrCode.expires_at ? (
            <Text type={isExpired ? "danger" : "success"}>
              {dayjs(qrCode.expires_at).format("MMMM D, YYYY h:mm A")}
            </Text>
          ) : (
            <Text type="success">Never expires</Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};