// components/Dashboard/modals/QRCodeDrawer.tsx
import React from 'react';
import { Drawer } from 'antd';

interface QRCodeDrawerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const QRCodeDrawer: React.FC<QRCodeDrawerProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  return (
    <Drawer
      title={title}
      open={visible}
      onClose={onClose}
      width={500}
      destroyOnHidden
    >
      {children}
    </Drawer>
  );
};