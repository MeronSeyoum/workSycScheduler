// ScheduleTemplateModal.tsx - Optimized with standardized color scheme
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Input, 
  Card, 
  List, 
  Button, 
  Popconfirm, 
  Empty, 
  Tag, 
  Row,
  Col,
  Statistic 
} from 'antd';
import { 
  Bookmark as BookmarkIcon, 
  Layout as TemplateIcon, 
  Trash2 as Trash2Icon, 
  Calendar as CalendarIcon,
  Users as UsersIcon,
  Clock as ClockIcon,
  Briefcase as BriefcaseIcon,
  Tag as TagIconLucide
} from 'lucide-react';
import dayjs from 'dayjs';
import { ScheduleTemplate } from '@/lib/types/schedule';


const { TextArea } = Input;

// Standardized Color Constants
const COLORS = {
  PRIMARY: 'oklch(51.1% 0.096 186.391)', // Teal 700 - Main brand color
  PRIMARY_DARK: 'oklch(43.7% 0.078 188.216)', // Teal 800
  PRIMARY_LIGHT: 'oklch(51.1% 0.096 186.391 / 0.1)',
  PRIMARY_BG: 'oklch(97.5% 0.013 186.391)', // Very light teal
  PRIMARY_BORDER: 'oklch(51.1% 0.096 186.391 / 0.2)',
  
  TEXT_PRIMARY: '#374151', // Gray 800
  TEXT_SECONDARY: '#6b7280', // Gray 500
  TEXT_DISABLED: '#9ca3af', // Gray 400
  
  BORDER_DEFAULT: 'oklch(0% 0 0 / 0.15)',
  BORDER_LIGHT: '#e5e7eb', // Gray 200
  
  BG_LIGHT: '#f8fafc', // Gray 50
  BG_CARD: '#ffffff',
  BG_HOVER: 'oklch(51.1% 0.096 186.391 / 0.05)',
  
  SUCCESS: '#059669', // Green 600
  WARNING: '#d97706', // Amber 600
  ERROR: '#dc2626', // Red 600
} as const;

interface ScheduleTemplateModalProps {
  visible: boolean;
  onCancel: () => void;
  templates: ScheduleTemplate[];
  onSaveTemplate: (name: string, description?: string) => void;
  onApplyTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  hasCurrentWeekData: boolean;
  loading?: boolean;
}

// Reusable Template Card Component
const TemplateCard: React.FC<{
  template: ScheduleTemplate;
  onApply: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}> = ({ template, onApply, onDelete, loading }) => {
  const formatShiftSummary = (template: ScheduleTemplate) => {
    const assignedCount = template.weekSchedule.shifts.filter(s => s.employees.length > 0).length;
    const unassignedCount = template.weekSchedule.shifts.filter(s => s.employees.length === 0).length;
    const draftCount = template.weekSchedule.shifts.filter(s => s.status === 'draft').length;
    
    const parts = [];
    if (assignedCount > 0) parts.push(`${assignedCount} assigned`);
    if (unassignedCount > 0) parts.push(`${unassignedCount} unassigned`);
    if (draftCount > 0) parts.push(`${draftCount} drafts`);
    
    return parts.join(' • ');
  };

  return (
    <Card 
      className="w-full hover:shadow-md transition-shadow cursor-pointer"
      style={{ 
        border: `1px solid ${COLORS.BORDER_LIGHT}`,
        backgroundColor: COLORS.BG_CARD,
      }}
      bodyStyle={{ padding: '16px' }}
      onClick={(e) => {
        // Only trigger apply if the click wasn't on a button
        if (!(e.target as HTMLElement).closest('button')) {
          onApply(template.id);
        }
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold" style={{ color: COLORS.TEXT_PRIMARY }}>
              {template.name}
            </h4>
            {template.isDefault && (
              <Tag color="blue" style={{ fontSize: '11px', padding: '0 6px' }}>Default</Tag>
            )}
            {template.tags?.map(tag => (
              <Tag key={tag} color="geekblue" style={{ fontSize: '11px', padding: '0 6px' }}>
                {tag}
              </Tag>
            ))}
          </div>

          {template.description && (
            <p className="text-sm mb-3 line-clamp-2" style={{ color: COLORS.TEXT_SECONDARY }}>
              {template.description}
            </p>
          )}

          <Row gutter={16} className="mb-3">
            <Col span={6}>
              <Statistic
                title="Shifts"
                value={template.weekSchedule.metadata.totalShifts}
                valueStyle={{ fontSize: '16px', color: COLORS.PRIMARY }}
                prefix={<BriefcaseIcon size={14} />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Hours"
                value={template.weekSchedule.metadata.totalHours}
                valueStyle={{ fontSize: '16px', color: COLORS.PRIMARY }}
                prefix={<ClockIcon size={14} />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="Employees"
                value={template.weekSchedule.metadata.employeeCount}
                valueStyle={{ fontSize: '16px', color: COLORS.PRIMARY }}
                prefix={<UsersIcon size={14} />}
              />
            </Col>
            <Col span={6}>
              <div className="text-center">
                <div className="text-xs mb-1" style={{ color: COLORS.TEXT_SECONDARY }}>
                  Created
                </div>
                <div className="text-sm font-medium" style={{ color: COLORS.TEXT_PRIMARY }}>
                  {dayjs(template.createdAt).format('MMM D')}
                </div>
              </div>
            </Col>
          </Row>

          <div className="text-xs space-y-1" style={{ color: COLORS.TEXT_SECONDARY }}>
            <div>
              <strong>Location:</strong> {template.weekSchedule.metadata.locationName}
            </div>
            <div>
              <strong>Contains:</strong> {formatShiftSummary(template)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
          <Button
            type="primary"
            size="small"
            onClick={() => onApply(template.id)}
            loading={loading}
            icon={<TemplateIcon size={14} />}
            style={{
              backgroundColor: COLORS.PRIMARY,
              borderColor: COLORS.PRIMARY,
              fontSize: '12px',
              height: '28px'
            }}
          >
            Apply
          </Button>
          <Popconfirm
            title="Delete Template"
            description="Are you sure you want to delete this template?"
            onConfirm={() => onDelete(template.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2Icon size={14} />}
              style={{ fontSize: '12px', height: '28px' }}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
};

// Reusable Mode Toggle Button Component
const ModeToggleButton: React.FC<{
  mode: 'save' | 'apply';
  currentMode: 'save' | 'apply';
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}> = ({ mode, currentMode, onClick, icon, label, disabled }) => (
  <Button
    type={mode === currentMode ? 'primary' : 'text'}
    onClick={onClick}
    className="flex-1 flex items-center justify-center gap-2"
    icon={icon}
    disabled={disabled}
    style={{
      backgroundColor: mode === currentMode ? COLORS.PRIMARY : 'transparent',
      borderColor: mode === currentMode ? COLORS.PRIMARY : 'transparent',
      color: mode === currentMode ? 'white' : disabled ? COLORS.TEXT_DISABLED : COLORS.TEXT_PRIMARY,
      opacity: disabled ? 0.6 : 1,
    }}
  >
    {label}
  </Button>
);

export const ScheduleTemplateModal: React.FC<ScheduleTemplateModalProps> = ({
  visible,
  onCancel,
  templates,
  onSaveTemplate,
  onApplyTemplate,
  onDeleteTemplate,
  hasCurrentWeekData,
  loading = false
}) => {
  const [mode, setMode] = useState<'save' | 'apply'>('save');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  useEffect(() => {
    if (visible) {
      setMode(hasCurrentWeekData ? 'save' : 'apply');
      setTemplateName('');
      setTemplateDescription('');
    }
  }, [visible, hasCurrentWeekData]);

  const handleSave = () => {
    if (!templateName.trim()) return;
    onSaveTemplate(templateName.trim(), templateDescription.trim() || undefined);
    setTemplateName('');
    setTemplateDescription('');
    onCancel();
  };

  const handleApply = (templateId: string) => {
    onApplyTemplate(templateId);
    onCancel();
  };

  const sortedTemplates = templates.sort((a, b) => 
    dayjs(b.createdAt).diff(dayjs(a.createdAt))
  );

  const footerButtons = mode === 'save' ? [
    <Button key="cancel" onClick={onCancel} style={{ borderColor: COLORS.BORDER_DEFAULT }}>
      Cancel
    </Button>,
    <Button 
      key="mode-switch" 
      onClick={() => setMode('apply')} 
      disabled={templates.length === 0}
      style={{
        borderColor: COLORS.PRIMARY,
        color: COLORS.PRIMARY
      }}
    >
      View Templates ({templates.length})
    </Button>,
    <Button
      key="save"
      type="primary"
      onClick={handleSave}
      loading={loading}
      disabled={!templateName.trim() || !hasCurrentWeekData}
      icon={<BookmarkIcon size={16} />}
      style={{
        backgroundColor: COLORS.PRIMARY,
        borderColor: COLORS.PRIMARY,
        color: COLORS.BG_LIGHT
      }}
    >
      Save Template
    </Button>
  ] : [
    <Button key="cancel" onClick={onCancel} style={{ borderColor: COLORS.BORDER_DEFAULT }}>
      Cancel
    </Button>,
    <Button 
      key="mode-switch" 
      onClick={() => setMode('save')} 
      disabled={!hasCurrentWeekData}
      style={{
        borderColor: COLORS.PRIMARY,
        color: COLORS.PRIMARY
      }}
    >
      Create New Template
    </Button>
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          {mode === 'save' ? (
            <BookmarkIcon size={20} style={{ color: COLORS.PRIMARY }} />
          ) : (
            <TemplateIcon size={20} style={{ color: COLORS.PRIMARY }} />
          )}
          <span style={{ color: COLORS.TEXT_PRIMARY, fontWeight: 600 }}>
            {mode === 'save' ? 'Save Schedule Template' : 'Apply Schedule Template'}
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={footerButtons}
      styles={{
        body: { 
          backgroundColor: COLORS.BG_LIGHT,
          padding: '24px'
        }
      }}
    >
      <div className="space-y-6">
        {/* Mode Toggle */}
        <div 
          className="flex gap-1 p-1 rounded-lg"
          style={{ backgroundColor: COLORS.BG_LIGHT }}
        >
          <ModeToggleButton
            mode="save"
            currentMode={mode}
            onClick={() => setMode('save')}
            icon={<BookmarkIcon size={16} />}
            label="Save Current Week"
            disabled={!hasCurrentWeekData}
          />
          <ModeToggleButton
            mode="apply"
            currentMode={mode}
            onClick={() => setMode('apply')}
            icon={<TemplateIcon size={16} />}
            label="Apply Template"
            disabled={templates.length === 0}
          />
        </div>

        {/* Save Mode */}
        {mode === 'save' && (
          <>
            {hasCurrentWeekData ? (
              <div className="space-y-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.TEXT_PRIMARY }}
                  >
                    Template Name *
                  </label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name (e.g., 'Standard Week', 'Holiday Schedule')"
                    prefix={<TagIconLucide size={16} style={{ color: COLORS.TEXT_DISABLED }} />}
                    maxLength={50}
                    showCount
                    style={{ borderColor: COLORS.BORDER_DEFAULT }}
                  />
                </div>

                <div>
                  <label 
                    className="block text-sm font-medium mb-2"
                    style={{ color: COLORS.TEXT_PRIMARY }}
                  >
                    Description (Optional)
                  </label>
                  <TextArea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe when to use this template..."
                    rows={3}
                    maxLength={200}
                    showCount
                    style={{ borderColor: COLORS.BORDER_DEFAULT }}
                  />
                </div>

                <div 
                  className="rounded-lg p-3"
                  style={{ 
                    backgroundColor: COLORS.PRIMARY_BG,
                    border: `1px solid ${COLORS.PRIMARY_BORDER}`
                  }}
                >
                  <div className="text-sm" style={{ color: COLORS.PRIMARY }}>
                    <div className="font-medium mb-1">Current week will be saved as template:</div>
                    <div className="text-xs opacity-90">
                      This will save all shifts, employee assignments, and times from the current week for future reuse.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon size={48} style={{ color: COLORS.TEXT_DISABLED }} className="mx-auto mb-4" />
                <p className="font-medium mb-1" style={{ color: COLORS.TEXT_SECONDARY }}>
                  No schedule data in current week
                </p>
                <p className="text-sm" style={{ color: COLORS.TEXT_DISABLED }}>
                  Add some shifts to save as a template
                </p>
              </div>
            )}
          </>
        )}

        {/* Apply Mode */}
        {mode === 'apply' && (
          <>
            {templates.length > 0 ? (
              <div className="space-y-4">
                <div 
                  className="text-sm rounded-lg p-3"
                  style={{ 
                    backgroundColor: COLORS.PRIMARY_BG,
                    border: `1px solid ${COLORS.PRIMARY_BORDER}`
                  }}
                >
                  <div className="font-medium mb-1" style={{ color: COLORS.PRIMARY }}>
                    How templates work:
                  </div>
                  <div className="text-xs opacity-90" style={{ color: COLORS.PRIMARY }}>
                    Templates will create shifts for the current week with the same employee assignments and times as saved.
                  </div>
                </div>
                
                <List
                  className="max-h-96 overflow-auto"
                  dataSource={sortedTemplates}
                  renderItem={(template) => (
                    <List.Item className="!border-0 !p-0 !mb-3 last:!mb-0">
                      <TemplateCard 
                        template={template}
                        onApply={handleApply}
                        onDelete={onDeleteTemplate}
                        loading={loading}
                      />
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <Empty
                image={<BookmarkIcon size={48} style={{ color: COLORS.TEXT_DISABLED }} />}
                description={
                  <div className="text-center">
                    <p className="font-medium mb-1" style={{ color: COLORS.TEXT_SECONDARY }}>
                      No templates saved yet
                    </p>
                    <p className="text-sm" style={{ color: COLORS.TEXT_DISABLED }}>
                      Create your first template from a scheduled week
                    </p>
                  </div>
                }
              >
                <Button
                  type="primary"
                  onClick={() => setMode('save')}
                  disabled={!hasCurrentWeekData}
                  icon={<BookmarkIcon size={16} />}
                  style={{
                    backgroundColor: COLORS.PRIMARY,
                    borderColor: COLORS.PRIMARY
                  }}
                >
                  Create Your First Template
                </Button>
              </Empty>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};