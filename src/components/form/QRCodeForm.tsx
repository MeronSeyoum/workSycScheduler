'use client';
import { Form, Select, DatePicker, Button } from 'antd';
import dayjs from 'dayjs';
import { Client } from '@/lib/types/client';

interface QRCodeFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  loading: boolean;
  clients: Client[];
}

export default function QRCodeForm({ initialValues, onSubmit, loading, clients }: QRCodeFormProps) {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const formattedValues = {
      client_id: values.client_id,
      expires_at: values.expires_at ? dayjs(values.expires_at).toDate() : undefined
    };
    onSubmit(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        client_id: initialValues?.client_id,
        expires_at: initialValues?.expires_at ? dayjs(initialValues.expires_at) : undefined
      }}
    >
      <Form.Item
        name="client_id"
        label="Client"
        rules={[{ required: true, message: 'Please select a client' }]}
      >
        <Select
          placeholder="Select a client"
          options={clients.map(client => ({
            value: client.id,
            label: client.business_name
          }))}
          disabled={!!initialValues} // Disable if editing
        />
      </Form.Item>

      <Form.Item
        name="expires_at"
        label="Expiration Date"
      >
        <DatePicker 
          style={{ width: '100%' }}
          showTime
          format="YYYY-MM-DD HH:mm:ss"
        />
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          block
        >
          {initialValues ? 'Update QR Code' : 'Generate QR Code'}
        </Button>
      </Form.Item>
    </Form>
  );
}