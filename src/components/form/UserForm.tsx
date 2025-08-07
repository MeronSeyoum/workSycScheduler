import React from 'react';
import { Form, Input, Select, Button, Upload, message, DatePicker } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface UserFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  loading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        last_login: initialValues.last_login ? dayjs(initialValues.last_login) : null,
      });
    }
  }, [initialValues, form]);

  const onFinish = (values: any) => {
    const formattedValues = {
      ...values,
      id: initialValues?.id,
      last_login: values.last_login?.format('YYYY-MM-DD HH:mm:ss'),
    };
    onSubmit(formattedValues);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        role: 'employee',
        status: 'active'
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
        <Form.Item
          name="first_name"
          label="First Name"
          rules={[{ required: true, message: 'Please input first name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="last_name"
          label="Last Name"
          rules={[{ required: true, message: 'Please input last name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input />
        </Form.Item>

        {!initialValues && (
          <>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input password!' },
                { min: 8, message: 'Password must be at least 8 characters!' }
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select role!' }]}
        >
          <Select>
            <Option value="admin">Admin</Option>
            <Option value="manager">Manager</Option>
            <Option value="employee">Employee</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status!' }]}
        >
          <Select>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="suspended">Suspended</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="profile_image"
          label="Profile Image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload name="profile_image" listType="picture" beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          name="last_login"
          label="Last Login"
        >
          <DatePicker showTime style={{ width: '100%' }} disabled />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone Number"
          rules={[
            { pattern: /^[0-9+\-() ]+$/, message: 'Please enter a valid phone number!' }
          ]}
        >
          <Input />
        </Form.Item>
      </div>

      <div className="px-6">
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? 'Update User' : 'Create User'}
          </Button>
        </Form.Item>
      </div>
    </Form>
  );
};

export default UserForm;