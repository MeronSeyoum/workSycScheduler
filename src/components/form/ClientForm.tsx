import React from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Select, 
  Row, 
  Col, 
  Space,
  Typography,
  Divider,
  InputNumber
} from 'antd';
import { 
  UserOutlined,
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  GlobalOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import { Client, ClientStatus } from '@/types/client';

const { Option } = Select;
const { Title } = Typography;

interface ClientFormProps {
  initialValues?: Client;
  onSubmit: (values: Client | Omit<Client, 'id'>) => void;
  loading: boolean;
}

const statusOptions: ClientStatus[] = ['active', 'inactive', 'on_hold'];

const ClientForm: React.FC<ClientFormProps> = ({ 
  initialValues, 
  onSubmit, 
  loading 
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const onFinish = (values: any) => {
    const formattedValues = {
      ...values,
      location_address: {
        street: values.street,
        city: values.city,
        state: values.state,
        postal_code: values.postal_code,
        country: values.country
      }
    };
    
    // Remove the individual address fields we don't need in the final payload
    delete formattedValues.street;
    delete formattedValues.city;
    delete formattedValues.state;
    delete formattedValues.postal_code;
    delete formattedValues.country;

    onSubmit(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        status: 'active',
        ...initialValues,
        street: initialValues?.location_address?.street,
        city: initialValues?.location_address?.city,
        state: initialValues?.location_address?.state,
        postal_code: initialValues?.location_address?.postal_code,
        country: initialValues?.location_address?.country
      }}
    >
      {/* <Divider orientation="left">Basic Information</Divider> */}
      <div className=" px-6">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="business_name"
            label="Business Name"
            rules={[{ required: true, message: 'Please enter business name' }]}
          >
            <Input 
              placeholder="Acme Inc." 
              prefix={<UserOutlined />} 
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="contact_person"
            label="Contact Person"
          >
            <Input placeholder="John Doe" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              placeholder="contact@example.com" 
              prefix={<MailOutlined />} 
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input 
              placeholder="+1 (555) 123-4567" 
              prefix={<PhoneOutlined />} 
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Please select status' }]}
      >
        <Select placeholder="Select status">
          {statusOptions.map(status => (
            <Option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Divider orientation="left">Address Information</Divider>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="street"
            label="Street Address"
          >
            <Input 
              placeholder="123 Main St" 
              prefix={<EnvironmentOutlined />} 
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="city"
            label="City"
          >
            <Input placeholder="New York" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="state"
            label="State/Province"
          >
            <Input placeholder="NY" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="postal_code"
            label="Postal Code"
          >
            <Input placeholder="10001" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="country"
            label="Country"
          >
            <Input placeholder="United States" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Additional Information</Divider>

      <Form.Item
        name="notes"
        label="Notes"
      >
        <Input.TextArea rows={4} placeholder="Any additional notes about this client..." />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button 
            // type="primary" 
            style={{backgroundColor: '#0F6973', color: 'white'}}
            htmlType="submit" 
            loading={loading}
          >
            {initialValues ? 'Update Client' : 'Create Client'}
          </Button>
          <Button htmlType="button" onClick={() => form.resetFields()}>
            Reset
          </Button>
        </Space>
      </Form.Item>
      </div>
    </Form>
  );
};

export default ClientForm;