import React from 'react';
import { Form, Input, DatePicker, Select, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

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

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        hire_date: initialValues.hire_date ? dayjs(initialValues.hire_date) : null,
        termination_date: initialValues.termination_date ? dayjs(initialValues.termination_date) : null,
        assigned_locations: initialValues.assigned_locations || []
      });
    }
  }, [initialValues, form]);

  const onFinish = (values: any) => {
  const formattedValues = {
    ...values,
    id: initialValues?.id,
    hire_date: values.hire_date?.format('YYYY-MM-DD'),
    termination_date: values.termination_date?.format('YYYY-MM-DD'),
    profile_image_url: values.profile_image_url || "", // Ensure string
    // No need to map locations anymore since we renamed the field
  };
  onSubmit(formattedValues);
};

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        status: 'active',
        assigned_locations: []
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
        <Form.Item
          name="first_name"
          label="First Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="last_name"
          label="Last Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: 'email' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="phone_number"
          label="Phone Number"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="position"
          label="Position"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="employee_code"
          label="Employee Code"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true }]}
        >
          <Select>
            {['active', 'on_leave', 'terminated', 'inactive', 'suspended'].map(status => (
              <Option key={status} value={status}>{status}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
  name="profile_image_url"
  label="Profile Image URL"
  initialValue="" // Ensure it's never undefined
>
          <Input />
        </Form.Item>

        <Form.Item
          name="hire_date"
          label="Hire Date"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="termination_date"
          label="Termination Date"
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
  name="assigned_locations"  // Changed from "locations"
  label="Assigned Locations"
>
  <Select mode="multiple">
    {locations.map(location => (
      <Option key={location.id} value={location.business_name}>
        {location.business_name}
      </Option>
    ))}
  </Select>
</Form.Item>

        <Form.Item
          name={['contact', 'phone']}
          label="Contact Phone"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name={['contact', 'emergencyContact']}
          label="Emergency Contact"
        >
          <Input />
        </Form.Item>

        <Form.Item
          name={['contact', 'address']}
          label="Contact Address"
        >
          <Input />
        </Form.Item>
      </div>
<div className=" px-6">
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? 'Update' : 'Create'}
        </Button>
      </Form.Item>
      </div>
    </Form>
  );
};

export default EmployeeForm;