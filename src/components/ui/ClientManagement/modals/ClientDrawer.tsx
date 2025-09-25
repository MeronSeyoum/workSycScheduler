// components/Dashboard/modals/ClientDrawer.tsx
import React from 'react';
import { Drawer } from 'antd';

interface ClientDrawerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ClientDrawer: React.FC<ClientDrawerProps> = ({
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
      width={700}
      destroyOnHidden
    >
      {children}
    </Drawer>
  );
};

