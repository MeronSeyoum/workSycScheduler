// components/Dashboard/forms/ModernGeofenceForm.tsx
import React, { useState, useEffect } from 'react';
import { Form, Select, Steps, Button, Card, Avatar, InputNumber, Row, Col, Slider, Segmented, Descriptions, Tag, Statistic } from 'antd';
import { UserOutlined, EnvironmentOutlined, RadarChartOutlined, CheckCircleOutlined, EditOutlined, AimOutlined, SaveOutlined, GlobalOutlined } from '@ant-design/icons';
import { Geofence } from '@/lib/types/geofence';
import { Client } from '@/lib/types/client';

const { Option } = Select;

interface ModernGeofenceFormProps {
  initialValues?: Geofence;
  onSubmit: (values: any) => void;
  loading: boolean;
  clients: Client[];
}

export const GeofenceForm: React.FC<ModernGeofenceFormProps> = ({
  initialValues,
  onSubmit,
  loading,
  clients,
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [locationMethod, setLocationMethod] = useState("manual");

  const steps = [
    {
      title: "Select Client",
      icon: <UserOutlined />,
      description: "Choose which client this geofence belongs to",
    },
    {
      title: "Set Location",
      icon: <EnvironmentOutlined />,
      description: "Define the geographical center point",
    },
    {
      title: "Configure Area",
      icon: <RadarChartOutlined />,
      description: "Set the radius and coverage area",
    },
    {
      title: "Review & Save",
      icon: <CheckCircleOutlined />,
      description: "Confirm your geofence settings",
    },
  ];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setSelectedClient(
        clients.find((c) => c.id === initialValues.client_id) || null
      );
      setCurrentStep(3);
    } else {
      form.resetFields();
      setCurrentStep(0);
      setSelectedClient(null);
    }
  }, [initialValues, clients, form]);

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(["client_id"]);
      } else if (currentStep === 1) {
        await form.validateFields(["latitude", "longitude"]);
      } else if (currentStep === 2) {
        await form.validateFields(["radius_meters"]);
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = (values: any) => {
    const submitData = {
      client_id: values.client_id,
      latitude: parseFloat(values.latitude?.toString() || '0'),
      longitude: parseFloat(values.longitude?.toString() || '0'),
      radius_meters: parseInt(values.radius_meters?.toString() || '500'),
      accuracy: values.accuracy || 95,
      status: values.status || 'active',
    };
    
    if (initialValues?.id) {
      submitData.client_id = initialValues.id;
    }
    
    onSubmit(submitData);
  };

  const handleClientSelect = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    setSelectedClient(client || null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <UserOutlined className="text-4xl text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold">Select Client</h3>
              <p className="text-gray-600">
                Choose which client this geofence will be associated with
              </p>
            </div>

            <Form.Item
              name="client_id"
              rules={[{ required: true, message: "Please select a client" }]}
            >
              <Select
                size="large"
                placeholder="Search and select a client"
                showSearch
                // filterOption={(input, option) =>
                //   option?.children
                //     ?.toString()
                //     .toLowerCase()
                //     .indexOf(input.toLowerCase()) >= 0
                // }
                onChange={handleClientSelect}
                disabled={!!initialValues}
              >
                {clients.map((client) => (
                  <Option key={client.id} value={client.id}>
                    <div className="flex items-center gap-3 py-2">
                      <Avatar
                        size="small"
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#0F6973" }}
                      />
                      <div>
                        <div className="font-medium">
                          {client.business_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {client.contact_person}
                        </div>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedClient && (
              <Card size="small" style={{ backgroundColor: "#f8f9fa" }}>
                <div className="flex items-center gap-3">
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#0F6973" }}
                  />
                  <div>
                    <div className="font-medium">
                      {selectedClient.business_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedClient.contact_person}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedClient.location_address?.city},{" "}
                      {selectedClient.location_address?.state}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <EnvironmentOutlined className="text-4xl text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">Set Location Center</h3>
              <p className="text-gray-600">
                Define the geographical center point for your geofence
              </p>
            </div>

            <Segmented
              options={[
                {
                  label: "Manual Entry",
                  value: "manual",
                  icon: <EditOutlined />,
                },
                { label: "Map Pick", value: "map", icon: <AimOutlined /> },
              ]}
              value={locationMethod}
              onChange={setLocationMethod}
              block
            />

            {locationMethod === "manual" ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="latitude"
                    label="Latitude"
                    rules={[
                      { required: true, message: "Please enter latitude" },
                      {
                        validator: (_, value) => {
                          if (value && (value < -90 || value > 90)) {
                            return Promise.reject(
                              new Error("Latitude must be between -90 and 90")
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      size="large"
                      placeholder="e.g., 37.7749"
                      step={0.0001}
                      precision={6}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="longitude"
                    label="Longitude"
                    rules={[
                      { required: true, message: "Please enter longitude" },
                      {
                        validator: (_, value) => {
                          if (value && (value < -180 || value > 180)) {
                            return Promise.reject(
                              new Error(
                                "Longitude must be between -180 and 180"
                              )
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      size="large"
                      placeholder="e.g., -122.4194"
                      step={0.0001}
                      precision={6}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ) : (
              <div className="text-center py-8">
                <AimOutlined className="text-4xl text-blue-500 mb-4" />
                <p className="text-gray-600 mb-4">
                  Map selection interface would appear here
                </p>
                <Button type="dashed" icon={<GlobalOutlined />}>
                  Open Map Picker
                </Button>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <RadarChartOutlined className="text-4xl text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold">Configure Coverage Area</h3>
              <p className="text-gray-600">
                Set the radius and monitoring parameters
              </p>
            </div>

            <Form.Item
              name="radius_meters"
              label={`Radius: ${
                form.getFieldValue("radius_meters") || 500
              } meters`}
              rules={[
                { required: true, message: "Please set radius" },
                {
                  validator: (_, value) => {
                    if (value && (value < 10 || value > 5000)) {
                      return Promise.reject(
                        new Error("Radius must be between 10 and 5000 meters")
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Slider
                min={10}
                max={5000}
                step={10}
                marks={{
                  10: "10m",
                  1000: "1km",
                  2000: "2km",
                  3000: "3km",
                  4000: "4km",
                  5000: "5km",
                }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="accuracy"
                  label="Detection Accuracy"
                  help="Higher accuracy may impact battery life"
                >
                  <Slider
                    min={50}
                    max={100}
                    step={5}
                    marks={{
                      50: "50%",
                      75: "75%",
                      100: "100%",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Status" initialValue="active">
                  <Select>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                    <Option value="testing">Testing</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Card
              size="small"
              title="Coverage Summary"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <Statistic
                title="Approximate Area"
                value={Math.round(
                  Math.PI *
                    Math.pow(form.getFieldValue("radius_meters") || 500, 2)
                )}
                suffix="m²"
                valueStyle={{ fontSize: "16px" }}
              />
            </Card>
          </div>
        );

      case 3:
        const values = form.getFieldsValue();
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircleOutlined className="text-4xl text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">
                Review Geofence Settings
              </h3>
              <p className="text-gray-600">Confirm all details before saving</p>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Client">
                {clients.find((c) => c.id === values.client_id)
                  ?.business_name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {values.latitude}, {values.longitude}
              </Descriptions.Item>
              <Descriptions.Item label="Radius">
                {values.radius_meters} meters
              </Descriptions.Item>
              <Descriptions.Item label="Coverage Area">
                ~
                {Math.round(Math.PI * Math.pow(values.radius_meters || 500, 2))}{" "}
                m²
              </Descriptions.Item>
              <Descriptions.Item label="Accuracy">
                {values.accuracy || 95}%
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={values.status === "active" ? "green" : "orange"}>
                  {values.status || "active"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <Steps
        current={currentStep}
        items={steps.map((step, index) => ({
          title: step.title,
          description: currentStep === index ? step.description : undefined,
          icon: step.icon,
        }))}
        responsive
        className="mb-8"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          radius_meters: 500,
          accuracy: 95,
          status: "active",
          ...initialValues,
        }}
      >
        <div className="min-h-64 mb-6">{renderStepContent()}</div>

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 0}
            size="large"
          >
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={handleNext} size="large">
              Next
            </Button>
          ) : (
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: "#0F6973", borderColor: "#0F6973" }}
              icon={<SaveOutlined />}
              size="large"
            >
              {initialValues ? "Update Geofence" : "Create Geofence"}
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};