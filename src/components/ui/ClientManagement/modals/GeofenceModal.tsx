// components/Dashboard/modals/GeofenceModal.tsx
import React from 'react';
import { Modal } from 'antd';

interface GeofenceModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const GeofenceModal: React.FC<GeofenceModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnHidden
    >
      {children}
    </Modal>
  );
};

