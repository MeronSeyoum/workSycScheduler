import React from 'react';
import {
  Modal,
  Avatar,
  Descriptions,
  Tag,
  Divider,
  Space,
  Typography,
  Row,
  Col,
  Button,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  BankOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Employee } from '@/lib/types/employee';

const { Text, Title } = Typography;

interface EmployeeViewModalProps {
  employee: Employee | null;
  visible: boolean;
  onClose: () => void;
}

const STATUS_COLOR_MAP = {
  active: "green",
  on_leave: "orange", 
  terminated: "red",
  inactive: "gray",
  suspended: "volcano",
} as const;

const EmployeeViewModal: React.FC<EmployeeViewModalProps> = ({
  employee,
  visible,
  onClose,
}) => {
  if (!employee) return null;

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          Employee Details
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ]}
      width={800}
      centered
    >
      <div style={{ padding: '16px 0' }}>
        {/* Header Section */}
        <Row gutter={24} align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Avatar
              size={80}
              src={employee.profile_image_url}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#0F6973' }}
            />
          </Col>
          <Col flex={1}>
            <Title level={3} style={{ margin: 0, color: '#0F6973' }}>
              {employee.first_name} {employee.last_name}
            </Title>
            <Space size={16}>
              <Tag color={STATUS_COLOR_MAP[employee.status]} style={{ textTransform: 'capitalize' }}>
                {employee.status.replace('_', ' ')}
              </Tag>
              <Text type="secondary">
                <TeamOutlined /> {employee.position}
              </Text>
            </Space>
          </Col>
        </Row>

        <Divider />

        {/* Personal Information */}
        <Descriptions title="Personal Information" column={2} bordered size="small">
          <Descriptions.Item label="Full Name" span={2}>
            {employee.first_name} {employee.last_name}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Space>
              <MailOutlined />
              {employee.email}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {employee.contact?.phone ? (
              <Space>
                <PhoneOutlined />
                {employee.phone_number}
              </Space>
            ) : (
              <Text type="secondary">Not provided</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Employee ID">
            <Space>
              <IdcardOutlined />
              {employee.employee_code || 'N/A'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {/* {employee.date_of_birth ? (
              <Space>
                <CalendarOutlined />
                {dayjs(employee.date_of_birth).format('MMM D, YYYY')}
              </Space>
            ) : ( */}
              <Text type="secondary">Not provided</Text>
            {/* )} */}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Employment Details */}
        <Descriptions title="Employment Details" column={2} bordered size="small">
          <Descriptions.Item label="Position">
            <Space>
              <TeamOutlined />
              {employee.position}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Department">
            {/* {employee.department || 'N/A'} */}
            {'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Hire Date">
            <Space>
              <CalendarOutlined />
              {dayjs(employee.hire_date).format('MMM D, YYYY')}
              <Text type="secondary">
                ({dayjs().diff(dayjs(employee.hire_date), 'month')} months ago)
              </Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Employment Type">
            {/* {employee.employment_type ||} */}
            {'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Salary">
            {/* {employee.salary ? `$${employee.salary.toLocaleString()}` :} */}
             {'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={STATUS_COLOR_MAP[employee.status]}>
              {employee.status.replace('_', ' ')}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Contact Information */}
        <Descriptions title="Contact Information" column={1} bordered size="small">
          <Descriptions.Item label="Address">
            {employee.contact?.address ? (
              <Space>
                <EnvironmentOutlined />
                {employee.contact.address}
              </Space>
            ) : (
              <Text type="secondary">Not provided</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Emergency Contact">
            {employee.contact?.emergencyContact ? (
              <Space direction="vertical" size={0}>
                <Text>{employee.contact.emergencyContact} - {employee.contact.phone}</Text>

                {/* <Text>{employee.contact.address}</Text> */}
              </Space>
            ) : (
              <Text type="secondary">Not provided</Text>
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Assigned Locations */}
        <div>
          <Title level={5}>
            <BankOutlined /> Assigned Locations
          </Title>
          {employee.assigned_locations && employee.assigned_locations.length > 0 ? (
            <Space wrap>
              {employee.assigned_locations.map((location, index) => (
                <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                  {location}
                </Tag>
              ))}
            </Space>
          ) : (
            <Text type="secondary">No locations assigned</Text>
          )}
        </div>

        <Divider />

        {/* Additional Information */}
        <Descriptions title="Additional Information" column={1} bordered size="small">
          <Descriptions.Item label="Skills/Certifications">
            {/* {employee.skills && employee.skills.length > 0 ? (
              <Space wrap>
                {employee.skills.map((skill, index) => (
                  <Tag key={index} color="green" icon={<SafetyCertificateOutlined />}>
                    {skill}
                  </Tag>
                ))}
              </Space>
            ) : ( */}
              <Text type="secondary">No skills/certifications listed</Text>
            {/* )} */}
          </Descriptions.Item>
          <Descriptions.Item label="Notes">
            {/* {employee.notes ||  */}
            <Text type="secondary">No additional notes</Text>
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};

export default EmployeeViewModal;