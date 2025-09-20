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
  const [form] = Form.useForm(); // Form instance
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
      title={modalTitle}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      closeIcon={<X size={18} />}
      style={{
        top: "20px",
      }}
    >
      <Form
        form={form} // Connect the form instance
        layout="vertical"
        className="p-1"
      >
        <Tabs
          defaultActiveKey="shift"
          className="mb-2"
          items={[
            {
              key: "shift",
              label: (
                <span className="flex items-center gap-2 ">
                  <Clock size={16} /> Shift
                </span>
              ),
            },
            {
              key: "templates",
              label: (
                <span className="flex items-center gap-2">
                  <TagIcon size={16} /> Templates
                </span>
              ),
            },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 -mt-2 ">
          {/* Date */}
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select a date" }]}
            className="mb-0"
          >
            <DatePicker
              format="ddd, MMM D, YYYY"
              className="w-full"
              suffixIcon={<Calendar size={16} />}
            />
          </Form.Item>

          {/* Shift Name (for unassigned shifts) */}
          {isUnassigned && (
            <Form.Item
              name="name"
              label="Shift Name"
              rules={[{ required: true, message: "Please enter a shift name" }]}
              className="mb-0"
            >
              <Input
                prefix={<TagIcon size={16} className="text-gray-400" />}
                placeholder="Enter shift name"
              />
            </Form.Item>
          )}
        </div>

        {/* Time Section */}
        <div className="bg-gray-50 border border-blue-100 rounded-lg px-3 pt-3 mb-2 -mt-2">
          <div className="flex items-center ">
            <FaRegClock className="text-teal-700 mr-2" />
            <span className="font-medium text-gray-700">Time</span>
          </div>

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
              />
            </Form.Item>

            <Form.Item
              name="breakDuration"
              label="Break (min)"
              initialValue={30}
              className="mb-0"
            >
              <Select>
                <Option value={0}>0 min</Option>
                <Option value={15}>15 min</Option>
                <Option value={30}>30 min</Option>
                <Option value={45}>45 min</Option>
                <Option value={60}>60 min</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        {/* Repeat Section */}
        <div className="bg-gray-50 border border-purple-100 rounded-lg p-4 mb-2">
          <div className="flex items-center mb-2">
            <Repeat size={16} className="text-teal-700 mr-2" />
            <span className="font-medium text-gray-700">Repeat</span>
          </div>

          <Form.Item className="mb-1">
            <Select
              value={repeatOption}
              onChange={setRepeatOption}
              className="w-full"
            >
              {repeatOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Repeat On Days - show when repeat is selected */}
          {repeatOption !== "never" &&
            repeatOption !== "daily" &&
            repeatOption !== "weekdays" && (
              <div className="">
                <div className="text-sm mb-1 text-gray-600">Repeat on:</div>
                <div className="flex gap-1">
                  {weekDays.map(({ name, number, date }) => (
                    <div
                      key={number}
                      className={`flex flex-col items-center justify-center w-full h-12  cursor-pointer transition-colors ${
                        selectedDays.includes(number)
                          ? "bg-teal-700 text-white"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => handleDaySelection(number)}
                    >
                      <div className="text-xs font-semibold">{name}</div>
                      <div className="text-xs mt-0.5">{date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
          {/* Location Section */}
          <Form.Item
            name="client"
            label="Location"
            rules={[{ required: true, message: "Please select a location" }]}
            className="mb-0"
          >
            <Select
              suffixIcon={<MapPin size={16} className="text-gray-400" />}
              placeholder="Select location"
            >
              {clients.map((client) => (
                <Option key={client.id} value={client.business_name}>
                  {client.business_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Position Section */}
          <Form.Item
            name="position"
            label="Position"
            rules={[{ required: true, message: "Please select a position" }]}
            className="mb-0"
          >
            <Select
              suffixIcon={<Briefcase size={16} className="text-gray-400" />}
              placeholder="Select position"
              onChange={setSelectedPosition}
            >
              {positions.map((position) => (
                <Option key={position} value={position}>
                  {position}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Employee Section (only show for assigned shifts) */}
        {!isUnassigned && (
          <div className="-mt-3">
            <Form.Item
              name="employee"
              label="Employee"
              rules={[{ required: true, message: "Please select an employee" }]}
              className="mb-4"
            >
              <Select
                suffixIcon={<User size={16} className="text-gray-400" />}
                placeholder="Select employee"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const children = option?.children;
                  if (typeof children === "string") {
                    return children;
                  }
                  return false;
                }}
              >
                {filteredEmployees.map((employee) => (
                  <Option key={employee.id} value={employee.first_name}>
                    <div className="flex items-center gap-2">
                      {employee.avatar ? (
                        <Avatar src={employee.avatar} size="small" />
                      ) : (
                        <Avatar size="small" className="bg-teal-500 text-white">
                          {employee.user.first_name?.charAt(0).toUpperCase()}
                        </Avatar>
                      )}
                      <span>{employee.user.first_name} </span>
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md ml-2">
                        {employee.position}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        )}

        <div className="-mt-4">
          {/* Note Section */}
          <Form.Item name="note" label="Notes" className="">
            <TextArea rows={3} placeholder="Add notes about this shift..." />
          </Form.Item>
        </div>
        
        {/* Publish Section */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-6">
          <div className="flex items-center">
            <MdPublish size={18} className="text-gray-600 mr-2" />
            <span className="text-gray-700">Publish immediately</span>
          </div>
          <Switch checked={publishShift} onChange={setPublishShift} />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
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
                  className="flex items-center text-red-500 hover:text-red-600"
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
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              size="large"
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 border-teal-600 hover:border-teal-700"
            >
              {isEditMode ? "Update Shift" : "Create Shift"}
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  );
};
