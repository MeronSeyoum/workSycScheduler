
// components/Dashboard/forms/QRCodeForm.tsx
import React, { useEffect } from 'react';
import { Form, Select, DatePicker, Button, Card, Badge } from 'antd';
import { QrcodeOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import dayjs from 'dayjs';
import { QRCode } from '@/lib/types/qrcode';
import { Client } from '@/lib/types/client';

const { Option } = Select;

interface QRCodeFormProps {
  initialValues?: QRCode;
  onSubmit: (values: any) => void;
  loading: boolean;
  clients: Client[];
}

export const QRCodeForm: React.FC<QRCodeFormProps> = ({
  initialValues,
  onSubmit,
  loading,
  clients,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      const formData = {
        ...initialValues,
        expires_at: initialValues.expires_at
          ? dayjs(initialValues.expires_at)
          : null,
      };
      form.setFieldsValue(formData);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const submitData = {
      ...values,
      expires_at: values.expires_at ? dayjs(values.expires_at).toDate() : undefined
    };
    onSubmit(submitData);
  };

  return (
    <div className="p-6">
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <QrcodeOutlined className="text-2xl text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {initialValues ? "Edit QR Code" : "Generate QR Code"}
            </h3>
            <p className="text-gray-600">
              {initialValues
                ? "Update QR code settings"
                : "Create a new QR code for client access"}
            </p>
          </div>

          <Form.Item
            name="client_id"
            label="Select Client"
            rules={[{ required: true, message: "Please select a client" }]}
          >
            <Select
              size="large"
              placeholder="Choose a client"
              showSearch
              // filterOption={(input, option) =>
              //   option?.children
              //     ?.toString()
              //     .toLowerCase()
              //     .indexOf(input.toLowerCase()) >= 0
              // }
              disabled={!!initialValues}
            >
              {clients.map((client) => (
                <Option key={client.id} value={client.id}>
                  <div className="flex items-center gap-3 py-1">
                    <Avatar
                      size="small"
                      icon={<UserOutlined />}
                      style={{ backgroundColor: "#0F6973" }}
                    />
                    <span>{client.business_name}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="expires_at"
            label="Expiration Date (Optional)"
            help="Leave empty for no expiration"
          >
            <DatePicker
              size="large"
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD"
              placeholder="Select expiration date"
            />
          </Form.Item>

          {initialValues && (
            <Card
              size="small"
              style={{
                backgroundColor: "#f8fffe",
                border: "1px solid #e0f2fe",
              }}
            >
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">QR Code Value:</span>
                  <span className="font-mono text-sm">
                    {initialValues.code_value}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    status={
                      initialValues.expires_at &&
                      dayjs().isAfter(dayjs(initialValues.expires_at))
                        ? "error"
                        : "success"
                    }
                    text={
                      initialValues.expires_at &&
                      dayjs().isAfter(dayjs(initialValues.expires_at))
                        ? "Expired"
                        : "Active"
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: "#0F6973", borderColor: "#0F6973" }}
              icon={<SaveOutlined />}
              size="large"
            >
              {initialValues ? "Update QR Code" : "Generate QR Code"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};
