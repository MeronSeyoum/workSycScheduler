import React, { useEffect, useMemo } from 'react';
import { Form, Input, DatePicker, Select, Button, Row, Col, Divider, Card } from 'antd';
import { SaveOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

// Constants to prevent recreation on every render
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
] as const;

const POSITIONS = [
  "Manager",
  "Supervisor",
  "Team Leader", 
  "Cleaning Technician",
  "Janitor",
  "Sanitation Specialist",
  "Floor Care Specialist",
  "Window Cleaner",
  "Carpet Cleaner",
  "Restroom Attendant",
  "Waste Management Operator",
  "Disinfection Specialist",
  "Green Cleaning Specialist"
] as const;

interface EmployeeFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  loading: boolean;
  locations: any[];
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialValues,
  onSubmit,
  loading,
  locations
}) => {
  const [form] = Form.useForm();

  // Memoize location options to prevent recreation
  const locationOptions = useMemo(() => 
    locations.map(location => ({
      key: location.id,
      value: location.business_name,
      label: location.business_name
    })), [locations]
  );

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        hire_date: initialValues.hire_date ? dayjs(initialValues.hire_date) : null,
        termination_date: initialValues.termination_date ? dayjs(initialValues.termination_date) : null,
        assigned_locations: initialValues.assigned_locations || []
      });
    } else {
      // Reset form when no initial values (creating new employee)
      form.resetFields();
    }
  }, [initialValues, form]);

  const onFinish = (values: any) => {
    const formattedValues = {
      ...values,
      id: initialValues?.id,
      hire_date: values.hire_date?.format('YYYY-MM-DD'),
      termination_date: values.termination_date?.format('YYYY-MM-DD') || null,
      profile_image_url: values.profile_image_url?.trim() || "",
      // Ensure contact object exists with proper structure
      contact: {
        phone: values.contact?.phone?.trim() || "",
        emergencyContact: values.contact?.emergencyContact?.trim() || "",
        address: values.contact?.address?.trim() || "",
      }
    };
    onSubmit(formattedValues);
  };

  const validatePhoneNumber = (_: any, value: string) => {
    if (value && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(value)) {
      return Promise.reject(new Error('Please enter a valid phone number'));
    }
    return Promise.resolve();
  };

  return (
    <div className="px-6">
      <div className="text-center mb-8">
        {/* <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <UserOutlined className="text-2xl text-blue-600" />
        </div> */}
        {/* <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {initialValues ? "Edit Employee" : "Add New Employee"}
        </h3> */}
        <p className="text-gray-600 text-left">
          {initialValues
            ? "Update employee information"
            : "Enter employee details to create a new account"}
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: 'active',
          assigned_locations: [],
          profile_image_url: "",
          contact: {
            phone: "",
            emergencyContact: "",
            address: ""
          }
        }}
        validateTrigger="onBlur"
        scrollToFirstError
      >
        {/* Personal Information */}
        <Card size="small" title="Personal Information" className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[
                  { required: true, message: 'Please enter first name' },
                  { min: 2, message: 'First name must be at least 2 characters' }
                ]}
              >
                <Input 
                  size="large" 
                  placeholder="Enter first name"
                  maxLength={50}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[
                  { required: true, message: 'Please enter last name' },
                  { min: 2, message: 'Last name must be at least 2 characters' }
                ]}
              >
                <Input 
                  size="large" 
                  placeholder="Enter last name"
                  maxLength={50}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
              >
                <Input 
                  size="large" 
                  placeholder="Enter email address"
                  maxLength={100}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label="Phone Number"
                rules={[
                  { validator: validatePhoneNumber }
                ]}
              >
                <Input 
                  size="large" 
                  placeholder="Enter phone number"
                  maxLength={20}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="profile_image_url"
                label="Profile Image URL"
                help="Optional: Enter a URL for the employee's profile picture"
              >
                <Input 
                  size="large" 
                  placeholder="https://example.com/profile.jpg"
                  maxLength={500}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Employment Information */}
        <Card size="small" title="Employment Information" className="mb-6">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="employee_code"
                label="Employee Code"
                help="Optional: Unique identifier for the employee"
              >
                <Input 
                  size="large" 
                  placeholder="e.g., EMP001"
                  maxLength={20}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[{ required: true, message: 'Please select a position' }]}
              >
                <Select 
                  size="large" 
                  placeholder="Select position"
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                >
                  {POSITIONS.map(position => (
                    <Option key={position} value={position}>
                      {position}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Employment Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select size="large" placeholder="Select status">
                  {STATUS_OPTIONS.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="hire_date"
                label="Hire Date"
                rules={[{ required: true, message: 'Please select hire date' }]}
              >
                <DatePicker 
                  size="large" 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current > dayjs().endOf('day')}
                  placeholder="Select hire date"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="termination_date"
                label="Termination Date"
                help="Only required for terminated employees"
              >
                <DatePicker 
                  size="large" 
                  style={{ width: '100%' }} 
                  format="YYYY-MM-DD"
                  placeholder="Select termination date"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assigned_locations"
                label="Assigned Locations"
                help="Select locations where this employee will work"
              >
                <Select 
                  mode="multiple"
                  size="large"
                  placeholder="Select assigned locations"
                  options={locationOptions}
                  maxTagCount="responsive"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Contact Information */}
        <Card size="small" title="Contact Information" className="mb-6">
          <Row gutter={16}>
              <Col span={12}>
              <Form.Item
                name={['contact', 'emergencyContact']}
                label="Emergency Contact"
                // help="Nameof emergency contact"
              >
                <Input 
                  size="large" 
                  placeholder="e.g., John Doe"
                  maxLength={100}
                />
              </Form.Item>
            </Col>
             <Col span={12}>
              <Form.Item
                name={['contact', 'phone']}
                label="Emergency Contact Phone"
                rules={[{ validator: validatePhoneNumber }]}
              >
                <Input 
                  size="large" 
                  placeholder="Enter contact phone number"
                  maxLength={20}
                />
              </Form.Item>
            </Col>
         
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name={['contact', 'address']}
                label="Home Address"
              >
                <TextArea 
                  rows={3}
                  placeholder="Enter complete address"
                  maxLength={300}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            icon={<SaveOutlined />}
            style={{
              backgroundColor: '#0F6973',
              borderColor: '#0F6973',
              minWidth: 120
            }}
          >
            {initialValues ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EmployeeForm;