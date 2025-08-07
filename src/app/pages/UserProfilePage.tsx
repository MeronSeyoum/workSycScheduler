// app/account/profile/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Upload, 
  message, 
  Divider, 
  Tabs, 
  Avatar, 
  Typography, 
  Switch,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  PhoneOutlined,
} from '@ant-design/icons';
import { apiCall as api } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import type { User } from '@/types/employee';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const UserProfilePage = () => {
  const [form] = Form.useForm();
  const { user: currentUser, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (currentUser) {
      form.setFieldsValue({
        ...currentUser,
        // Add any necessary transformations here
      });
      setLoading(false);
    }
  }, [currentUser, form]);

  const handleProfileUpdate = async (values: Partial<User>) => {
    setSubmitting(true);
    try {
      await api.users.update(currentUser!.id, values, token!);
      message.success('Profile updated successfully');
      refresh(); // Refresh auth state
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    setSubmitting(true);
    try {
      await api.auth.changePassword(values.currentPassword, values.newPassword, token!);
      message.success('Password changed successfully');
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
    } catch (error) {
      message.error('Failed to change password');
    } finally {
      setSubmitting(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    return isImage;
  };

  const uploadProps = {
    beforeUpload,
    showUploadList: false,
    customRequest: async ({ file }: { file: File }) => {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const updatedUser = await api.users.uploadAvatar(formData, token!);
        refresh(); // Update auth context
        message.success('Avatar updated successfully');
      } catch (error) {
        message.error('Avatar upload failed');
      }
    }
  };

  if (loading || !currentUser) return <div className="flex justify-center p-8"><Spin size="large" /></div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Card loading={loading} title="My Account">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Side - Profile Summary */}
          <div className="w-full md:w-1/3">
            <div className="flex flex-col items-center text-center mb-6">
              <Upload {...uploadProps}>
                <Avatar 
                  size={128} 
                  src={currentUser.avatar} 
                  icon={<UserOutlined />}
                  className="mb-4 cursor-pointer"
                />
              </Upload>
              <Title level={4} className="mb-0">
                {currentUser.first_name} {currentUser.last_name}
              </Title>
              <Text type="secondary">{currentUser.email}</Text>

              <Divider className="my-4" />

              <div className="w-full text-left space-y-2">
                <div className="flex items-center">
                  <MailOutlined className="mr-2" />
                  <Text>{currentUser.email}</Text>
                </div>
                {currentUser.phone && (
                  <div className="flex items-center">
                    <PhoneOutlined className="mr-2" />
                    <Text>{currentUser.phone}</Text>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Detailed Info */}
          <div className="w-full md:w-2/3">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Profile Information" key="profile">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleProfileUpdate}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                      <Input prefix={<MailOutlined />} disabled={true} />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone Number">
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </div>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                      Update Profile
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab="Security" key="security">
                <Card title="Change Password" className="mb-4">
                  <Form layout="vertical" onFinish={handlePasswordChange}>
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[{ required: true }]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[{ required: true, min: 8 }]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Form.Item
                      name="confirmPassword"
                      label="Confirm New Password"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject('The two passwords do not match!');
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={submitting}>
                        Change Password
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>

                <Card title="Security Settings">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <Title level={5} className="mb-1">Two-Factor Authentication</Title>
                        <Text type="secondary">Add an extra layer of security</Text>
                      </div>
                      <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                    </div>
                  </div>
                </Card>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfilePage;