// components/Dashboard/forms/ClientForm.tsx
import React, { useEffect } from 'react';
import { Form, Input, Select, Button, Row, Col, Divider } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { Client } from '@/lib/types/client';

const { Option } = Select;

interface ClientFormProps {
  initialValues?: Client;
  onSubmit: (values: any) => void;
  loading: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialValues,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values: any) => {
    const submitData = {
      ...values,
      location_address: values.location_address || {},
    };
    
    // Include the ID from initialValues if it exists (for updates)
    if (initialValues?.id) {
      submitData.id = initialValues.id;
    }
    onSubmit(submitData);
  };

  return (
    <div className="px-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        <div className="space-y-6">
          <div className="text-center mb-8">
            <p className="text-gray-600">
              {initialValues
                ? "Update client information"
                : "Enter client details to create a new account"}
            </p>
          </div>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="business_name"
                label="Business Name"
                rules={[
                  { required: true, message: "Please enter business name" },
                ]}
              >
                <Input size="large" placeholder="Enter business name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact_person"
                label="Contact Person"
                rules={[
                  { required: true, message: "Please enter contact person" },
                ]}
              >
                <Input size="large" placeholder="Enter contact person name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter valid email" },
                ]}
              >
                <Input size="large" placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input size="large" placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select size="large" placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="on_hold">On Hold</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Address Information</Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name={["location_address", "street"]}
                label="Street Address"
              >
                <Input size="large" placeholder="Enter street address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item name={["location_address", "city"]} label="City">
                <Input size="large" placeholder="Enter city" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name={["location_address", "state"]} label="Province">
                <Input size="large" placeholder="Enter state" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name={["location_address", "country"]}
                label="Country"
              >
                <Input size="large" placeholder="Canada" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item
                name={["location_address", "postal_code"]}
                label="Postal Code"
              >
                <Input size="large" placeholder="Enter postal code" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: "#0F6973", borderColor: "#0F6973" }}
              icon={<SaveOutlined />}
              size="large"
            >
              {initialValues ? "Update Client" : "Create Client"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};