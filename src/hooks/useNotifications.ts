// hooks/useNotifications.ts
import { useCallback } from 'react';
import { notification } from 'antd';
// import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

export const useNotifications = () => {
  const [api, contextHolder] = notification.useNotification();

  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info', message: string, description: string) => {
      // Create the icon configuration object without JSX
      // const iconConfig = {
      //   success: {
      //     icon: CheckCircleOutlined,
      //     style: { color: '#52c41a' }
      //   },
      //   error: {
      //     icon: CloseCircleOutlined,
      //     style: { color: '#ff4d4f' }
      //   },
      //   info: {
      //     icon: InfoCircleOutlined,
      //     style: { color: '#1890ff' }
      //   }
      // };

      // const config = iconConfig[type];

      api[type]({
        message,
        description,
        // icon: config.icon(config.style),
        placement: 'topRight',
        duration: type === 'error' ? 4 : 3,
      });
    },
    [api]
  );

  return { showNotification, contextHolder };
};
