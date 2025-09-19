import React, { useState, useMemo } from "react";
import { Alert, Collapse, List, Tag, Button } from "antd";
import { 
  FaExclamationTriangle, 
  FaChevronDown, 
  FaChevronRight,
  FaUserClock,
  FaUtensils,
  FaCalendarWeek,
  FaClock
} from "react-icons/fa";

const { Panel } = Collapse;

interface ComplianceWarningsProps {
  warnings: string[];
  onClose: () => void;
}

interface GroupedWarnings {
  weeklyLimit: string[];
  breakRequirements: string[];
  overtime: string[];
  consecutiveShifts: string[];
  other: string[];
}

export const ComplianceWarnings: React.FC<ComplianceWarningsProps> = ({
  warnings,
  onClose,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Group warnings by type for better organization
  const groupedWarnings = useMemo(() => {
    const groups: GroupedWarnings = {
      weeklyLimit: [],
      breakRequirements: [],
      overtime: [],
      consecutiveShifts: [],
      other: []
    };

    warnings.forEach(warning => {
      if (warning.includes('Weekly hour limit')) {
        groups.weeklyLimit.push(warning);
      } else if (warning.includes('Break requirement')) {
        groups.breakRequirements.push(warning);
      } else if (warning.includes('Potential overtime')) {
        groups.overtime.push(warning);
      } else if (warning.includes('Consecutive shift')) {
        groups.consecutiveShifts.push(warning);
      } else {
        groups.other.push(warning);
      }
    });

    return groups;
  }, [warnings]);

  // Count warnings by type for summary
  const warningCounts = {
    weeklyLimit: groupedWarnings.weeklyLimit.length,
    breakRequirements: groupedWarnings.breakRequirements.length,
    overtime: groupedWarnings.overtime.length,
    consecutiveShifts: groupedWarnings.consecutiveShifts.length,
    other: groupedWarnings.other.length
  };

  const totalWarnings = warnings.length;

  if (totalWarnings === 0) return null;

  // Helper to extract employee name from warning
  const getEmployeeName = (warning: string): string => {
    const match = warning.match(/for (.+?):/);
    return match ? match[1] : 'Unknown Employee';
  };

  // Helper to extract date from warning
  const getDate = (warning: string): string => {
    const match = warning.match(/on (\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : '';
  };

  return (
    <Alert
      message={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-500" />
            <span className="font-semibold">Compliance Warnings ({totalWarnings})</span>
            
            {/* Warning type badges */}
            {warningCounts.weeklyLimit > 0 && (
              <Tag color="red" className="flex items-center gap-1">
                <FaCalendarWeek /> {warningCounts.weeklyLimit}
              </Tag>
            )}
            {warningCounts.breakRequirements > 0 && (
              <Tag color="orange" className="flex items-center gap-1">
                <FaUtensils /> {warningCounts.breakRequirements}
              </Tag>
            )}
            {warningCounts.overtime > 0 && (
              <Tag color="volcano" className="flex items-center gap-1">
                <FaClock /> {warningCounts.overtime}
              </Tag>
            )}
            {warningCounts.consecutiveShifts > 0 && (
              <Tag color="purple" className="flex items-center gap-1">
                <FaUserClock /> {warningCounts.consecutiveShifts}
              </Tag>
            )}
          </div>
          
          <Button 
            type="text" 
            size="small" 
            icon={expanded ? <FaChevronDown /> : <FaChevronRight />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      }
      description={
        expanded && (
          <div className="mt-4">
            <Collapse 
              defaultActiveKey={['weeklyLimit', 'breakRequirements', 'overtime', 'consecutiveShifts']}
              ghost
              className="bg-transparent"
            >
              {/* Weekly Limit Warnings */}
              {groupedWarnings.weeklyLimit.length > 0 && (
                <Panel 
                  header={
                    <div className="flex items-center gap-2">
                      <FaCalendarWeek className="text-red-500" />
                      <span>Weekly Hour Limits ({groupedWarnings.weeklyLimit.length})</span>
                    </div>
                  } 
                  key="weeklyLimit"
                >
                  <List
                    size="small"
                    dataSource={groupedWarnings.weeklyLimit}
                    renderItem={(warning) => (
                      <List.Item className="text-sm text-red-700 border-0 py-1">
                        • {warning}
                      </List.Item>
                    )}
                  />
                </Panel>
              )}

              {/* Break Requirement Warnings */}
              {groupedWarnings.breakRequirements.length > 0 && (
                <Panel 
                  header={
                    <div className="flex items-center gap-2">
                      <FaUtensils className="text-orange-500" />
                      <span>Break Requirements ({groupedWarnings.breakRequirements.length})</span>
                    </div>
                  } 
                  key="breakRequirements"
                >
                  <List
                    size="small"
                    dataSource={groupedWarnings.breakRequirements}
                    renderItem={(warning) => {
                      const employee = getEmployeeName(warning);
                      const date = getDate(warning);
                      return (
                        <List.Item className="text-sm text-orange-700 border-0 py-1">
                          <div className="flex justify-between w-full">
                            <span>{employee}</span>
                            <span className="text-orange-600">{date}</span>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                </Panel>
              )}

              {/* Overtime Warnings */}
              {groupedWarnings.overtime.length > 0 && (
                <Panel 
                  header={
                    <div className="flex items-center gap-2">
                      <FaClock className="text-volcano-500" />
                      <span>Overtime ({groupedWarnings.overtime.length})</span>
                    </div>
                  } 
                  key="overtime"
                >
                  <List
                    size="small"
                    dataSource={groupedWarnings.overtime}
                    renderItem={(warning) => {
                      const employee = getEmployeeName(warning);
                      const date = getDate(warning);
                      const hoursMatch = warning.match(/: (\d+) hours/);
                      const hours = hoursMatch ? hoursMatch[1] : '';
                      
                      return (
                        <List.Item className="text-sm text-volcano-700 border-0 py-1">
                          <div className="flex justify-between w-full">
                            <span>{employee}</span>
                            <div className="flex gap-2">
                              {date && <span className="text-volcano-600">{date}</span>}
                              {hours && <Tag  color="volcano">{hours}h</Tag>}
                            </div>
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                </Panel>
              )}

              {/* Consecutive Shift Warnings */}
              {groupedWarnings.consecutiveShifts.length > 0 && (
                <Panel 
                  header={
                    <div className="flex items-center gap-2">
                      <FaUserClock className="text-purple-500" />
                      <span>Consecutive Shifts ({groupedWarnings.consecutiveShifts.length})</span>
                    </div>
                  } 
                  key="consecutiveShifts"
                >
                  <List
                    size="small"
                    dataSource={groupedWarnings.consecutiveShifts}
                    renderItem={(warning) => (
                      <List.Item className="text-sm text-purple-700 border-0 py-1">
                        • {warning}
                      </List.Item>
                    )}
                  />
                </Panel>
              )}

              {/* Other Warnings */}
              {groupedWarnings.other.length > 0 && (
                <Panel 
                  header={`Other Issues (${groupedWarnings.other.length})`} 
                  key="other"
                >
                  <List
                    size="small"
                    dataSource={groupedWarnings.other}
                    renderItem={(warning) => (
                      <List.Item className="text-sm text-yellow-700 border-0 py-1">
                        • {warning}
                      </List.Item>
                    )}
                  />
                </Panel>
              )}
            </Collapse>
          </div>
        )
      }
      type="warning"
      showIcon={false}
      closable
      onClose={onClose}
      className="mb-6 rounded-lg border-yellow-200 bg-yellow-50"
    />
  );
};