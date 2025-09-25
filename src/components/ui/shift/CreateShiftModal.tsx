// CreateShiftModal.tsx - Optimized with standardized color scheme
import React, { useState, useEffect } from "react";
import {
  Modal,
  Select,
  Button,
  TimePicker,
  DatePicker,
  Avatar,
  Switch,
  Tabs,
  Input,
  Popconfirm,
  Form,
  Card,
} from "antd";
import dayjs from "dayjs";
import {
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  User,
  TagIcon,
  Trash2,
  Repeat,
  X,
} from "lucide-react";
import { MdPublish } from "react-icons/md";
import { FaRegClock } from "react-icons/fa";

const { Option } = Select;
const { TextArea } = Input;

// Standardized Color Constants
const COLORS = {
  PRIMARY: "oklch(51.1% 0.096 186.391)",
  PRIMARY_DARK: "oklch(43.7% 0.078 188.216)",
  PRIMARY_LIGHT: "oklch(51.1% 0.096 186.391 / 0.1)",
  PRIMARY_BG: "oklch(97.5% 0.013 186.391)",
  PRIMARY_BORDER: "oklch(51.1% 0.096 186.391 / 0.2)",
  
  TEXT_PRIMARY: "#374151",
  TEXT_SECONDARY: "#6b7280",
  TEXT_DISABLED: "#9ca3af",
  
  BORDER_DEFAULT: "oklch(0% 0 0 / 0.15)",
  BORDER_LIGHT: "#e5e7eb",
  
  BG_LIGHT: "#f8fafc",
  BG_CARD: "#ffffff",
  
  SUCCESS: "#059669",
  WARNING: "#d97706",
  ERROR: "#dc2626",
  INFO: "#2563eb",
  
  BLUE_BG: "#eff6ff",
  BLUE_BORDER: "#bfdbfe",
  PURPLE_BG: "#faf5ff",
  PURPLE_BORDER: "#e9d5ff",
} as const;

interface Employee {
  id: number;
  position: string;
  avatar?: string;
  first_name?: string;
  last_name?: string;
}

interface Client {
  id: number;
  business_name: string;
}

interface Shift {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  position: string;
  employee: string;
  client: string;
  note: string;
  name?: string;
  status: "published" | "draft";
}

interface CreateShiftModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (shiftData: any) => void;
  onDelete?: (shiftId: string) => void;
  employees?: Employee[];
  positions?: string[];
  clients?: Client[];
  selectedDate?: string;
  isUnassigned?: boolean;
  existingShift?: Shift | null;
  isEditMode?: boolean;
  selectedEmployee?: Employee;
}

// Reusable Section Card Component
const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  bgColor?: string;
  borderColor?: string;
}> = ({ icon, title, children, bgColor = COLORS.BG_LIGHT, borderColor = COLORS.BLUE_BORDER }) => (
  <Card 
    className="w-full mb-4"
    bodyStyle={{ padding: '8px 16px' }}
    style={{
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`,
      marginBottom: '10px' 
    }}
  >
    <div className="flex items-center ">
      <div style={{ color: COLORS.PRIMARY }}>{icon}</div>
      <span className="font-medium ml-2" style={{ color: COLORS.TEXT_PRIMARY }}>
        {title}
      </span>
    </div>
    {children}
  </Card>
);

export const CreateShiftModal: React.FC<CreateShiftModalProps> = ({
  visible,
  onCancel,
  onSave,
  onDelete,
  employees = [],
  positions = [],
  clients = [],
  selectedDate,
  isUnassigned = false,
  existingShift = null,
  isEditMode = false,
  selectedEmployee,
}) => {
  const [form] = Form.useForm();
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [repeatOption, setRepeatOption] = useState<string>("never");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [publishShift, setPublishShift] = useState<boolean>(true);

  // Filter employees based on selected position
  const filteredEmployees = selectedPosition
    ? employees.filter((emp) => emp.position === selectedPosition)
    : employees;

  // Reset form when modal opens/closes or selectedDate changes
  useEffect(() => {
    if (visible) {
      if (existingShift && isEditMode) {
        // Prefill with existing shift data
        form.setFieldsValue({
          date: dayjs(existingShift.date),
          startTime: existingShift.startTime
            ? dayjs(existingShift.startTime, "HH:mm")
            : null,
          endTime: existingShift.endTime
            ? dayjs(existingShift.endTime, "HH:mm")
            : null,
          breakDuration: existingShift.breakDuration || 30,
          position: existingShift.position || "",
          employee: existingShift.employee || "",
          client: existingShift.client || "",
          note: existingShift.note || "",
          name: existingShift.name || "",
        });
        setPublishShift(existingShift.status === "published");
      } else {
        // Prefill with selected employee data if available
        const initialDate = selectedDate ? dayjs(selectedDate) : dayjs();
        const employeeName = selectedEmployee
          ? `${selectedEmployee.first_name || ""} ${
              selectedEmployee.last_name || ""
            }`.trim()
          : "";

        form.setFieldsValue({
          date: initialDate,
          startTime: dayjs().set("hour", 9).set("minute", 0),
          endTime: dayjs().set("hour", 17).set("minute", 0),
          breakDuration: 30,
          position: selectedEmployee?.position || "",
          employee: employeeName,
          client: clients[0]?.business_name || "",
          note: "",
          name: isUnassigned ? `Shift ${initialDate.format("MMM D")}` : "",
        });
        setRepeatOption("never");
        setSelectedDays([]);
        setPublishShift(true);
      }
    }
  }, [
    visible,
    selectedDate,
    existingShift,
    isEditMode,
    form,
    selectedEmployee,
    clients,
    isUnassigned,
  ]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      const shiftData = {
        id: existingShift?.id,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.startTime?.format("HH:mm") || "",
        endTime: values.endTime?.format("HH:mm") || "",
        breakDuration: values.breakDuration,
        position: values.position,
        employee: values.employee,
        client: values.client,
        repeatOption,
        selectedDays,
        publish: publishShift,
        note: values.note,
        name: isUnassigned ? values.name : undefined,
        status: publishShift ? "published" : "draft",
      };
      onSave(shiftData);
    });
  };

  const handleDelete = () => {
    if (onDelete && existingShift?.id) {
      onDelete(existingShift.id);
    }
  };

  // Generate week days for the "Repeat on" section
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const currentDate = form.getFieldValue("date") || dayjs();
    const day = currentDate.startOf("week").add(i, "day");
    return {
      day,
      name: day.format("ddd"),
      number: day.day(),
      date: day.date(),
    };
  });

  const handleDaySelection = (dayNumber: number) => {
    if (selectedDays.includes(dayNumber)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayNumber));
    } else {
      setSelectedDays([...selectedDays, dayNumber]);
    }
  };

  const repeatOptions = [
    { value: "never", label: "Does not repeat" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "weekdays", label: "Every weekday (Mon-Fri)" },
  ];

  const modalTitle = isEditMode
    ? isUnassigned
      ? "Update Unassigned Shift"
      : "Update Shift"
    : isUnassigned
    ? "Create Unassigned Shift"
    : "Create New Shift";

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Clock size={20} style={{ color: COLORS.PRIMARY }} />
          <span style={{ color: COLORS.TEXT_PRIMARY, fontWeight: 600 }}>
            {modalTitle}
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      closeIcon={<X size={18} style={{ color: COLORS.TEXT_SECONDARY }} />}
      styles={{
        body: { 
          backgroundColor: COLORS.BG_LIGHT,
          padding: '4px 24px',
        }
      }}
    >
      <Form
        form={form}
        layout="vertical"
        className="space-y-4"
      >
        <Tabs
          defaultActiveKey="shift"
          items={[
            {
              key: "shift",
              label: (
                <span className="flex items-center gap-2">
                  <Clock size={16} style={{ color: COLORS.PRIMARY }} /> 
                  Shift Details
                </span>
              ),
              children: (
                <div className="">
                  {/* Date and Shift Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      name="date"
                      label="Date"
                      rules={[{ required: true, message: "Please select a date" }]}
                    >
                      <DatePicker
                        format="ddd, MMM D, YYYY"
                        className="w-full"
                        suffixIcon={<Calendar size={16} style={{ color: COLORS.TEXT_DISABLED }} />}
                        style={{ borderColor: COLORS.BORDER_DEFAULT }}
                      />
                    </Form.Item>

                    {isUnassigned && (
                      <Form.Item
                        name="name"
                        label="Shift Name"
                        rules={[{ required: true, message: "Please enter a shift name" }]}
                      >
                        <Input
                          prefix={<TagIcon size={16} style={{ color: COLORS.TEXT_DISABLED }} />}
                          placeholder="Enter shift name"
                          style={{ borderColor: COLORS.BORDER_DEFAULT }}
                        />
                      </Form.Item>
                    )}
                  </div>

                  {/* Time Section */}
                  <SectionCard
                    icon={<FaRegClock size={16} />}
                    title="Time"
                    bgColor={COLORS.BLUE_BG}
                    borderColor={COLORS.BLUE_BORDER}
                    
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Form.Item
                        name="startTime"
                        label="Start"
                        rules={[{ required: true, message: "Please select start time" }]}
                        className="mb-0"
                      >
                        <TimePicker
                          format="h:mm A"
                          className="w-full"
                          placeholder="9:00 AM"
                          style={{ borderColor: COLORS.BORDER_DEFAULT }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="endTime"
                        label="End"
                        rules={[{ required: true, message: "Please select end time" }]}
                        className="mb-0"
                      >
                        <TimePicker
                          format="h:mm A"
                          className="w-full"
                          placeholder="5:00 PM"
                          style={{ borderColor: COLORS.BORDER_DEFAULT }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="breakDuration"
                        label="Break (min)"
                        initialValue={30}
                        className="mb-0"
                      >
                        <Select style={{ borderColor: COLORS.BORDER_DEFAULT }}>
                          <Option value={0}>0 min</Option>
                          <Option value={15}>15 min</Option>
                          <Option value={30}>30 min</Option>
                          <Option value={45}>45 min</Option>
                          <Option value={60}>60 min</Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </SectionCard>

                  {/* Repeat Section */}
                  <SectionCard
                    icon={<Repeat size={16} />}
                    title="Repeat"
                    bgColor={COLORS.PURPLE_BG}
                    borderColor={COLORS.PURPLE_BORDER}
                    
                  >
                    <Form.Item className="mb-3">
                      <Select
                        value={repeatOption}
                        onChange={setRepeatOption}
                        className="w-full"
                        style={{ borderColor: COLORS.BORDER_DEFAULT }}
                      >
                        {repeatOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {/* Repeat On Days */}
                    {repeatOption !== "never" &&
                      repeatOption !== "daily" &&
                      repeatOption !== "weekdays" && (
                        <div>
                          <div className="text-sm mb-2" style={{ color: COLORS.TEXT_SECONDARY }}>
                            Repeat on:
                          </div>
                          <div className="flex gap-1">
                            {weekDays.map(({ name, number, date }) => (
                              <div
                                key={number}
                                className={`flex flex-col items-center justify-center w-full h-12 cursor-pointer transition-colors rounded ${
                                  selectedDays.includes(number)
                                    ? "text-white"
                                    : "text-gray-700 border border-gray-200 hover:border-blue-300"
                                }`}
                                style={{
                                  backgroundColor: selectedDays.includes(number) 
                                    ? COLORS.PRIMARY 
                                    : COLORS.BG_CARD
                                }}
                                onClick={() => handleDaySelection(number)}
                              >
                                <div className="text-xs font-semibold">{name}</div>
                                <div className="text-xs mt-0.5">{date}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </SectionCard>

                  {/* Location and Position */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      name="client"
                      label="Location"
                      rules={[{ required: true, message: "Please select a location" }]}
                    >
                      <Select
                        suffixIcon={<MapPin size={16} style={{ color: COLORS.TEXT_DISABLED }} />}
                        placeholder="Select location"
                        style={{ borderColor: COLORS.BORDER_DEFAULT }}
                      >
                        {clients.map((client) => (
                          <Option key={client.id} value={client.business_name}>
                            {client.business_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="position"
                      label="Position"
                      rules={[{ required: true, message: "Please select a position" }]}
                    >
                      <Select
                        suffixIcon={<Briefcase size={16} style={{ color: COLORS.TEXT_DISABLED }} />}
                        placeholder="Select position"
                        onChange={setSelectedPosition}
                        style={{ borderColor: COLORS.BORDER_DEFAULT }}
                      >
                        {positions.map((position) => (
                          <Option key={position} value={position}>
                            {position}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>

                  {/* Employee Section */}
                  {!isUnassigned && (
                    <Form.Item
                      name="employee"
                      label="Employee"
                      rules={[{ required: !isUnassigned, message: "Please select an employee" }]}
                    >
                      <Select
                        suffixIcon={<User size={16} style={{ color: COLORS.TEXT_DISABLED }} />}
                        placeholder="Select employee"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                          if (option?.children) {
                            return String(option.children).toLowerCase().includes(input.toLowerCase());
                          }
                          return false;
                        }}
                        style={{ borderColor: COLORS.BORDER_DEFAULT }}
                      >
                        {filteredEmployees.map((employee) => {
                          const firstName = employee.first_name || '';
                          const lastName = employee.last_name || '';
                          const displayName = `${firstName} ${lastName}`.trim();
                          
                          return (
                            <Option key={employee.id} value={employee.id.toString()}>
                              <div className="flex items-center gap-2">
                                {employee.avatar ? (
                                  <Avatar src={employee.avatar} size="small" />
                                ) : (
                                  <Avatar 
                                    size="small" 
                                    style={{ 
                                      backgroundColor: COLORS.PRIMARY,
                                      color: 'white'
                                    }}
                                  >
                                    {firstName?.charAt(0).toUpperCase() || 'U'}
                                  </Avatar>
                                )}
                                <span>{displayName}</span>
                                <span 
                                  className="inline-block px-2 py-0.5 text-xs rounded-md ml-2"
                                  style={{ 
                                    backgroundColor: COLORS.PRIMARY_LIGHT,
                                    color: COLORS.PRIMARY
                                  }}
                                >
                                  {employee.position}
                                </span>
                              </div>
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  )}

                  {/* Note Section */}
                  <Form.Item name="note" label="Notes">
                    <TextArea 
                      rows={3} 
                      placeholder="Add notes about this shift..." 
                      style={{ borderColor: COLORS.BORDER_DEFAULT }}
                    />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: "templates",
              label: (
                <span className="flex items-center gap-2">
                  <TagIcon size={16} style={{ color: COLORS.PRIMARY }} /> 
                  Templates
                </span>
              ),
              children: (
                <div className="text-center py-8">
                  <TagIcon size={48} style={{ color: COLORS.TEXT_DISABLED }} className="mx-auto mb-4" />
                  <p style={{ color: COLORS.TEXT_SECONDARY }} className="font-medium">
                    Shift Templates
                  </p>
                  <p style={{ color: COLORS.TEXT_DISABLED }} className="text-sm">
                    Save and reuse common shift patterns
                  </p>
                </div>
              ),
            },
          ]}
        />

        {/* Publish Section */}
        <Card 
          bodyStyle={{ padding: '16px' }}
          style={{
            backgroundColor: COLORS.BG_LIGHT,
            border: `1px solid ${COLORS.BORDER_LIGHT}`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MdPublish size={18} style={{ color: COLORS.TEXT_SECONDARY }} className="mr-2" />
              <span style={{ color: COLORS.TEXT_PRIMARY }}>Publish immediately</span>
            </div>
            <Switch 
              checked={publishShift} 
              onChange={setPublishShift}
              style={{
                backgroundColor: publishShift ? COLORS.PRIMARY : COLORS.TEXT_DISABLED
              }}
            />
          </div>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: COLORS.BORDER_LIGHT }}>
          <div>
            {isEditMode && existingShift?.id && onDelete && (
              <Popconfirm
                title="Delete Shift"
                description="Are you sure you want to delete this shift?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  icon={<Trash2 size={16} />}
                  danger
                  className="flex items-center"
                  style={{ color: COLORS.ERROR }}
                >
                  Delete Shift
                </Button>
              </Popconfirm>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onCancel}
              size="large"
              style={{
                borderColor: COLORS.BORDER_LIGHT,
                color: COLORS.TEXT_PRIMARY
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              size="large"
              style={{
                backgroundColor: COLORS.PRIMARY,
                borderColor: COLORS.PRIMARY
              }}
            >
              {isEditMode ? "Update Shift" : "Create Shift"}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};