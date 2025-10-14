// components/Dashboard/forms/ModernGeofenceForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Form, Select, Steps, Button, Card, Avatar, InputNumber, Row, Col, Slider, Segmented, Descriptions, Modal, Spin } from 'antd';
import { UserOutlined, EnvironmentOutlined, RadarChartOutlined, CheckCircleOutlined, EditOutlined, AimOutlined, SaveOutlined, GlobalOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Geofence } from '@/lib/types/geofence';
import { Client } from '@/lib/types/client';
import { AdvancedMapPicker } from '../modals/AdvancedMapPicker';

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
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [radiusValue, setRadiusValue] = useState(500); // Track radius for real-time updates

  const primaryColor = "#0F6973";
  const lightBg = "#F5F9FA";
  const darkText = "#1F2937";

  const steps = [
    { title: "Client", icon: <UserOutlined />, description: "Select client" },
    { title: "Location", icon: <EnvironmentOutlined />, description: "Set coordinates" },
    { title: "Coverage", icon: <RadarChartOutlined />, description: "Define radius" },
    { title: "Review", icon: <CheckCircleOutlined />, description: "Confirm & save" },
  ];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        client_id: initialValues.client_id,
      });
      setSelectedClient(clients.find((c) => c.id === initialValues.client_id) || null);
      setRadiusValue(initialValues.radius_meters || 500);
      setCurrentStep(3);
    } else {
      form.resetFields();
      setCurrentStep(0);
      setSelectedClient(null);
      setRadiusValue(500);
    }
  }, [initialValues, clients, form]);

  const handleAdvancedMapConfirm = (latitude: number, longitude: number) => {
    form.setFieldsValue({
      latitude: parseFloat(latitude.toFixed(6)),
      longitude: parseFloat(longitude.toFixed(6)),
    });
    setMapModalVisible(false);
  };

  const handleNext = async () => {
    try {
      const fieldsToValidate = {
        0: ['client_id'],
        1: ['latitude', 'longitude'],
        2: ['radius_meters']
      }[currentStep];

      if (fieldsToValidate) {
        await form.validateFields(fieldsToValidate);
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

  const handleFinish = () => {
    const values = form.getFieldsValue(true);
    
    const submitData = {
      client_id: values.client_id,
      latitude: parseFloat(values.latitude?.toString() || '0'),
      longitude: parseFloat(values.longitude?.toString() || '0'),
      radius_meters: parseInt(values.radius_meters?.toString() || '500'),
    };

    if (initialValues?.id) {
      const updateData = {
        ...submitData,
        id: initialValues.id,
      };
      onSubmit(updateData);
    } else {
      onSubmit(submitData);
    }
  };

  const handleClientSelect = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId);
    setSelectedClient(client || null);
  };

  const handleRadiusChange = (value: number) => {
    setRadiusValue(value);
    form.setFieldValue('radius_meters', value);
  };

  const isStepValid = () => {
    try {
      const values = form.getFieldsValue();
      switch (currentStep) {
        case 0:
          return !!values.client_id;
        case 1:
          return !!(values.latitude !== undefined && values.longitude !== undefined);
        case 2:
          return !!(values.radius_meters && values.radius_meters >= 10 && values.radius_meters <= 5000);
        default:
          return true;
      }
    } catch {
      return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: lightBg }}>
                <UserOutlined style={{ fontSize: '18px', color: primaryColor }} />
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: darkText }}>Select Client</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Choose client for this geofence
              </p>
            </div>

            <Form.Item
              name="client_id"
              rules={[{ required: true, message: "Please select a client" }]}
            >
              <Select
                size="large"
                placeholder="Search and select client..."
                showSearch
                onChange={handleClientSelect}
                disabled={!!initialValues}
                style={{ height: '44px', fontSize: '14px' }}
              >
                {clients.map((client) => (
                  <Option key={client.id} value={client.id}>
                    <div className="flex items-center gap-2 py-1">
                      <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: primaryColor }} />
                      <div>
                        <div className="font-medium text-xs" style={{ color: darkText }}>
                          {client.business_name}
                        </div>
                        {client.contact_person && (
                          <div className="text-xs" style={{ color: '#9CA3AF' }}>
                            {client.contact_person}
                          </div>
                        )}
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedClient && (
              <Card 
                style={{ 
                  backgroundColor: lightBg,
                  border: `1px solid #E5E7EB`,
                  borderRadius: '8px',
                  padding: '12px'
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: primaryColor }} />
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: darkText }}>
                      {selectedClient.business_name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                      {selectedClient.contact_person}
                    </div>
                    <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                      {selectedClient.location_address?.street && (
                        <>
                          {selectedClient.location_address.street}
                          {selectedClient.location_address.city && `, ${selectedClient.location_address.city}`}
                        </>
                      )}
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
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: lightBg }}>
                <EnvironmentOutlined style={{ fontSize: '18px', color: primaryColor }} />
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: darkText }}>Set Location</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Define geofence center point
              </p>
            </div>

            <Segmented
              options={[
                { label: "Manual Entry", value: "manual", icon: <EditOutlined /> },
                { label: "Map Pick", value: "map", icon: <AimOutlined /> },
              ]}
              value={locationMethod}
              onChange={setLocationMethod}
              block
              style={{
                padding: '4px',
                backgroundColor: lightBg,
                fontSize: '12px'
              }}
            />

            {locationMethod === "manual" ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="latitude"
                    label={<span style={{ color: darkText, fontWeight: '500', fontSize: '13px' }}>Latitude</span>}
                    rules={[
                      { required: true, message: "Enter latitude" },
                      {
                        validator: (_, value) => {
                          if (value && (value < -90 || value > 90)) {
                            return Promise.reject(new Error("Latitude must be between -90 and 90"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%", fontSize: '14px', height: '40px' }}
                      size="large"
                      placeholder="e.g., 51.0447"
                      step={0.0001}
                      precision={6}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="longitude"
                    label={<span style={{ color: darkText, fontWeight: '500', fontSize: '13px' }}>Longitude</span>}
                    rules={[
                      { required: true, message: "Enter longitude" },
                      {
                        validator: (_, value) => {
                          if (value && (value < -180 || value > 180)) {
                            return Promise.reject(new Error("Longitude must be between -180 and 180"));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%", fontSize: '14px', height: '40px' }}
                      size="large"
                      placeholder="e.g., -114.0719"
                      step={0.0001}
                      precision={6}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ) : (
              <div className="text-center py-6" style={{ backgroundColor: lightBg, borderRadius: '8px' }}>
                <AimOutlined style={{ fontSize: '28px', color: primaryColor, marginBottom: '12px' }} />
                <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
                  Open interactive map to select location
                </p>
                <Button 
                  type="primary" 
                  icon={<GlobalOutlined />}
                  size="middle"
                  onClick={() => setMapModalVisible(true)}
                  style={{ 
                    backgroundColor: primaryColor, 
                    borderColor: primaryColor,
                    height: '36px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  loading={mapLoading}
                >
                  {mapLoading ? 'Loading...' : 'Open Map'}
                </Button>
                
                {(form.getFieldValue("latitude") && form.getFieldValue("longitude")) && (
                  <div className="mt-4 p-3 rounded border" style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#065F46' }}>
                      ✓ Location Selected
                    </p>
                    <p className="text-xs" style={{ color: '#047857' }}>
                      Lat: <span className="font-mono">{form.getFieldValue("latitude")}</span><br />
                      Lng: <span className="font-mono">{form.getFieldValue("longitude")}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: lightBg }}>
                <RadarChartOutlined style={{ fontSize: '18px', color: primaryColor }} />
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: darkText }}>Define Coverage</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Set geofence radius
              </p>
            </div>

            <div style={{ backgroundColor: lightBg, padding: '20px', borderRadius: '8px' }}>
              <Form.Item
                name="radius_meters"
                rules={[
                  { required: true, message: "Please set radius" },
                  {
                    validator: (_, value) => {
                      if (value && (value < 10 || value > 5000)) {
                        return Promise.reject(new Error("Radius must be between 10 and 5000 meters"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span style={{ color: darkText, fontWeight: '500', fontSize: '13px' }}>Radius</span>
                    <span style={{ 
                      color: primaryColor, 
                      fontWeight: 'bold', 
                      fontSize: '18px',
                      backgroundColor: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      minWidth: '60px',
                      textAlign: 'center'
                    }}>
                      {radiusValue} m
                    </span>
                  </div>
                  <Slider
                    min={10}
                    max={5000}
                    step={10}
                    value={radiusValue}
                    onChange={handleRadiusChange}
                    marks={{
                      10: "10m",
                      1000: "1km",
                      2000: "2km",
                      3000: "3km",
                      4000: "4km",
                      5000: "5km",
                    }}
                    styles={{
                      track: { backgroundColor: primaryColor, height: '6px' },
                      handle: {
                        borderColor: primaryColor,
                        backgroundColor: 'white',
                        height: '16px',
                        width: '16px',
                      }
                    }}
                  />
                </div>
              </Form.Item>

              <Card style={{ backgroundColor: 'white', border: `1px solid #E5E7EB`, borderRadius: '8px' }} bodyStyle={{ padding: '12px' }}>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider" style={{ color: '#9CA3AF', marginBottom: '4px' }}>
                    Coverage Area
                  </p>
                  <p className="text-xl font-bold" style={{ color: primaryColor, marginBottom: '2px' }}>
                    {Math.round(Math.PI * Math.pow(radiusValue, 2)).toLocaleString()} m²
                  </p>
                </div>
              </Card>
            </div>
          </div>
        );

      case 3: {
        const values = form.getFieldsValue(true);
        const currentRadius = values.radius_meters || 500;
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: '#ECFDF5' }}>
                <CheckCircleOutlined style={{ fontSize: '20px', color: '#10B981' }} />
              </div>
              <h3 className="text-lg font-semibold mb-1" style={{ color: darkText }}>Review Geofence</h3>
              <p className="text-sm" style={{ color: '#6B7280' }}>
                Confirm details before saving
              </p>
            </div>

            <div className="space-y-3">
              <div style={{ backgroundColor: lightBg, padding: '16px', borderRadius: '8px' }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>Client</p>
                <p className="text-sm font-semibold" style={{ color: darkText }}>
                  {clients.find((c) => c.id === values.client_id)?.business_name || "N/A"}
                </p>
              </div>

              <div style={{ backgroundColor: lightBg, padding: '16px', borderRadius: '8px' }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>Location</p>
                <p className="text-xs font-mono" style={{ color: darkText }}>
                  <span style={{ fontWeight: '500' }}>Lat:</span> {values.latitude}
                </p>
                <p className="text-xs font-mono mt-1" style={{ color: darkText }}>
                  <span style={{ fontWeight: '500' }}>Lng:</span> {values.longitude}
                </p>
              </div>

              <div style={{ backgroundColor: lightBg, padding: '16px', borderRadius: '8px' }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>Coverage</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold" style={{ color: primaryColor }}>
                      {currentRadius} m
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>radius</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: '#10B981' }}>
                      {Math.round(Math.PI * Math.pow(currentRadius, 2)).toLocaleString()} m²
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>area</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      <div style={{ backgroundColor: '#FFFFFF', minHeight: '60vh' }}>
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #E5E7EB',
          backgroundColor: lightBg
        }}>
          <Steps
            current={currentStep}
            items={steps.map((step) => ({
              title: step.title,
              icon: step.icon,
            }))}
            size="small"
            responsive
          />
        </div>

        <div style={{ padding: '20px 16px' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              radius_meters: 500,
              ...initialValues,
            }}
          >
            <div style={{ minHeight: '320px' }}>
              {renderStepContent()}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              paddingTop: '16px', 
              borderTop: '1px solid #E5E7EB',
              marginTop: '16px'
            }}>
              <Button
                onClick={handlePrev}
                disabled={currentStep === 0}
                size="middle"
                style={{
                  height: '40px',
                  fontSize: '14px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  padding: '0 16px'
                }}
              >
                Back
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button 
                  type="primary" 
                  onClick={handleNext} 
                  size="middle"
                  disabled={!isStepValid()}
                  style={{
                    backgroundColor: isStepValid() ? primaryColor : '#9CA3AF',
                    borderColor: isStepValid() ? primaryColor : '#9CA3AF',
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '6px',
                    padding: '0 16px'
                  }}
                  icon={<ArrowRightOutlined />}
                  iconPosition="end"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ 
                    backgroundColor: primaryColor, 
                    borderColor: primaryColor,
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '6px',
                    padding: '0 16px'
                  }}
                  icon={<SaveOutlined />}
                  size="middle"
                >
                  {initialValues ? "Update" : "Create"}
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>

      <AdvancedMapPicker
        visible={mapModalVisible}
        onConfirm={handleAdvancedMapConfirm}
        onCancel={() => setMapModalVisible(false)}
        initialLatitude={form.getFieldValue("latitude") || 51.0447}
        initialLongitude={form.getFieldValue("longitude") || -114.0719}
        radiusMeters={radiusValue}
        showRadius={true}
        title="Select Geofence Location"
      />
    </>
  );
};