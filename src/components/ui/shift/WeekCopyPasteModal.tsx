// WeekCopyPasteModal.tsx - Optimized with standardized color scheme
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  DatePicker, 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Button, 
  Alert, 
  Divider,
  Tag
} from 'antd';
import { 
  Copy as CopyIcon, 
  Clipboard as PasteIcon, 
  Calendar as CalendarIcon, 
  Users as UsersIcon, 
  Clock as ClockIcon, 
  Briefcase as BriefcaseIcon 
} from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { WeekScheduleData } from '@/lib/types/schedule';

// Reuse the same standardized Color Constants
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
  SUCCESS_BG: '#f0fdf4', // Green 50
  SUCCESS_BORDER: '#bbf7d0', // Green 200
  
  WARNING: '#d97706', // Amber 600
  WARNING_BG: '#fffbeb', // Amber 50
  WARNING_BORDER: '#fde68a', // Amber 200
  
  ERROR: '#dc2626', // Red 600
  ERROR_BG: '#fef2f2', // Red 50
  ERROR_BORDER: '#fecaca', // Red 200
  
  INFO: '#2563eb', // Blue 600
  INFO_BG: '#eff6ff', // Blue 50
  INFO_BORDER: '#bfdbfe', // Blue 200
} as const;

interface WeekCopyPasteModalProps {
  visible: boolean;
  onCancel: () => void;
  copiedWeekSchedule: WeekScheduleData | null;
  currentWeek: Dayjs;
  onCopyWeek: () => void;
  onPasteWeek: (targetWeek: Dayjs) => void;
  loading?: boolean;
}

// Reusable Mode Toggle Button Component
const ModeToggleButton: React.FC<{
  mode: 'copy' | 'paste';
  currentMode: 'copy' | 'paste';
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

// Reusable Statistic Display Component
const ScheduleStats: React.FC<{ schedule: WeekScheduleData }> = ({ schedule }) => (
  <Row gutter={16} className="mb-3">
    <Col span={6}>
      <Statistic
        title="Shifts"
        value={schedule.metadata.totalShifts}
        prefix={<BriefcaseIcon size={16} style={{ color: COLORS.SUCCESS }} />}
        valueStyle={{ color: COLORS.SUCCESS, fontSize: '18px', fontWeight: 600 }}
      />
    </Col>
    <Col span={6}>
      <Statistic
        title="Hours"
        value={schedule.metadata.totalHours}
        prefix={<ClockIcon size={16} style={{ color: COLORS.SUCCESS }} />}
        valueStyle={{ color: COLORS.SUCCESS, fontSize: '18px', fontWeight: 600 }}
      />
    </Col>
    <Col span={6}>
      <Statistic
        title="Employees"
        value={schedule.metadata.employeeCount}
        prefix={<UsersIcon size={16} style={{ color: COLORS.SUCCESS }} />}
        valueStyle={{ color: COLORS.SUCCESS, fontSize: '18px', fontWeight: 600 }}
      />
    </Col>
    <Col span={6}>
      <div className="text-center">
        <div className="text-xs mb-1" style={{ color: COLORS.TEXT_SECONDARY }}>
          Source Week
        </div>
        <div className="text-sm font-medium" style={{ color: COLORS.SUCCESS }}>
          {dayjs(schedule.weekStart).format('MMM D')}
        </div>
      </div>
    </Col>
  </Row>
);

export const WeekCopyPasteModal: React.FC<WeekCopyPasteModalProps> = ({
  visible,
  onCancel,
  copiedWeekSchedule,
  currentWeek,
  onCopyWeek,
  onPasteWeek,
  loading = false
}) => {
  const [selectedWeek, setSelectedWeek] = useState<Dayjs>(currentWeek);
  const [mode, setMode] = useState<'copy' | 'paste'>('copy');

  useEffect(() => {
    if (visible) {
      setSelectedWeek(currentWeek);
      setMode(copiedWeekSchedule ? 'paste' : 'copy');
    }
  }, [visible, currentWeek, copiedWeekSchedule]);

  const handleCopy = () => {
    onCopyWeek();
    onCancel();
  };

  const handlePaste = () => {
    onPasteWeek(selectedWeek.startOf('isoWeek'));
    onCancel();
  };

  const getWeekRange = (week: Dayjs) => {
    const start = week.startOf('isoWeek');
    const end = week.endOf('isoWeek');
    return start.month() === end.month()
      ? `${start.format('MMM D')} - ${end.format('D, YYYY')}`
      : `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
  };

  // Check if target week has conflicts (same as source week)
  const hasConflict = copiedWeekSchedule && 
    selectedWeek.startOf('isoWeek').format('YYYY-MM-DD') === copiedWeekSchedule.weekStart;

  const footerButtons = [
    <Button key="cancel" onClick={onCancel} style={{ borderColor: COLORS.BORDER_DEFAULT }}>
      Cancel
    </Button>,
    <Button 
      key="mode-switch" 
      onClick={() => setMode(mode === 'copy' ? 'paste' : 'copy')}
      disabled={mode === 'paste' && !copiedWeekSchedule}
      style={{
        borderColor: COLORS.PRIMARY,
        color: COLORS.PRIMARY
      }}
    >
      Switch to {mode === 'copy' ? 'Paste' : 'Copy'}
    </Button>,
    <Button
      key="action"
      type="primary"
      onClick={mode === 'copy' ? handleCopy : handlePaste}
      loading={loading}
      disabled={!!(mode === 'paste' && (!copiedWeekSchedule || hasConflict))}
      icon={mode === 'copy' ? <CopyIcon size={16} /> : <PasteIcon size={16} />}
      style={{
        backgroundColor: mode === 'copy' ? COLORS.PRIMARY : COLORS.PRIMARY_DARK,
        borderColor: mode === 'copy' ? COLORS.PRIMARY : COLORS.PRIMARY_DARK,
        color: COLORS.BG_LIGHT
      }}
    >
      {mode === 'copy' ? 'Copy Current Week' : 'Paste to Selected Week'}
    </Button>
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          {mode === 'copy' ? (
            <CopyIcon size={20} style={{ color: COLORS.PRIMARY }} />
          ) : (
            <PasteIcon size={20} style={{ color: COLORS.PRIMARY_DARK }} />
          )}
          <span style={{ color: COLORS.TEXT_PRIMARY, fontWeight: 600 }}>
            {mode === 'copy' ? 'Copy Week Schedule' : 'Paste Week Schedule'}
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
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
            mode="copy"
            currentMode={mode}
            onClick={() => setMode('copy')}
            icon={<CopyIcon size={16} />}
            label="Copy Week"
          />
          <ModeToggleButton
            mode="paste"
            currentMode={mode}
            onClick={() => setMode('paste')}
            icon={<PasteIcon size={16} />}
            label="Paste Week"
            disabled={!copiedWeekSchedule}
          />
        </div>

        {/* Week Selection */}
        <div>
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: COLORS.TEXT_PRIMARY }}
          >
            {mode === 'copy' ? 'Current week will be copied:' : 'Select target week to paste to:'}
          </label>
          <DatePicker
            value={mode === 'copy' ? currentWeek : selectedWeek}
            onChange={(date) => {
              if (date && mode === 'paste') {
                setSelectedWeek(date);
              }
            }}
            format="MMM D, YYYY"
            className="w-full"
            picker="week"
            placeholder="Select week"
            disabled={mode === 'copy'}
            suffixIcon={<CalendarIcon size={16} style={{ color: COLORS.TEXT_DISABLED }} />}
            style={{
              borderColor: mode === 'copy' ? COLORS.BORDER_LIGHT : hasConflict ? COLORS.ERROR : COLORS.BORDER_LIGHT
            }}
          />
          <div className="text-sm mt-1" style={{ color: COLORS.TEXT_SECONDARY }}>
            Week: {mode === 'copy' ? getWeekRange(currentWeek) : getWeekRange(selectedWeek)}
          </div>
          
          {/* Conflict warning */}
          {hasConflict && (
            <div className="text-sm mt-1 flex items-center gap-1" style={{ color: COLORS.ERROR }}>
              ⚠️ Cannot paste to the same week that was copied
            </div>
          )}
        </div>

        {/* Copy Mode Info */}
        {mode === 'copy' && (
          <Alert
            message="Copy Week Schedule"
            description="This will copy all shifts from the current week to your clipboard. You can then paste them to any other week."
            type="info"
            showIcon
            icon={<CopyIcon size={16} />}
            style={{
              borderColor: COLORS.INFO_BORDER,
              backgroundColor: COLORS.INFO_BG
            }}
          />
        )}

        {/* Paste Mode Info */}
        {mode === 'paste' && (
          <>
            {copiedWeekSchedule ? (
              <Card 
                style={{ 
                  backgroundColor: COLORS.SUCCESS_BG,
                  borderColor: COLORS.SUCCESS_BORDER
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS.SUCCESS }}
                  ></div>
                  <span className="font-medium" style={{ color: COLORS.SUCCESS }}>
                    Ready to Paste
                  </span>
                  <Tag 
                    color="green" 
                    style={{ fontSize: '11px', padding: '0 6px' }}
                  >
                    {copiedWeekSchedule.metadata.locationName}
                  </Tag>
                </div>
                
                <ScheduleStats schedule={copiedWeekSchedule} />

                <Divider style={{ margin: '12px 0', borderColor: COLORS.SUCCESS_BORDER }} />

                <div className="text-sm space-y-1" style={{ color: COLORS.TEXT_SECONDARY }}>
                  <div>
                    <strong>Copied:</strong> {dayjs(copiedWeekSchedule.metadata.createdAt).format('MMM D, YYYY h:mm A')}
                  </div>
                  {copiedWeekSchedule.shifts.filter(s => s.employees.length === 0).length > 0 && (
                    <div>
                      <strong>Includes:</strong> {copiedWeekSchedule.shifts.filter(s => s.employees.length === 0).length} unassigned shifts
                    </div>
                  )}
                  {copiedWeekSchedule.shifts.filter(s => s.status === 'draft').length > 0 && (
                    <div>
                      <strong>Drafts:</strong> {copiedWeekSchedule.shifts.filter(s => s.status === 'draft').length} draft shifts
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Alert
                message="No Week Copied"
                description="You need to copy a week first before you can paste. Switch to Copy mode to select a week to copy."
                type="warning"
                showIcon
                style={{
                  borderColor: COLORS.WARNING_BORDER,
                  backgroundColor: COLORS.WARNING_BG
                }}
              />
            )}

            {/* Additional paste information */}
            {copiedWeekSchedule && !hasConflict && (
              <div 
                className="rounded-lg p-3"
                style={{ 
                  backgroundColor: COLORS.INFO_BG,
                  border: `1px solid ${COLORS.INFO_BORDER}`
                }}
              >
                <div className="text-sm" style={{ color: COLORS.INFO }}>
                  <div className="font-medium mb-1">What will be pasted:</div>
                  <ul className="text-xs space-y-1 ml-4" style={{ opacity: 0.9 }}>
                    <li>• All shift times and employee assignments will be preserved</li>
                    <li>• Shifts will be moved to the corresponding days in the target week</li>
                    <li>• Unassigned shifts will remain unassigned</li>
                    <li>• Draft shifts will maintain their draft status</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};