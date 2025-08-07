import { toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'error' | 'success';
}

export function toast({ title, description, variant = 'default' }: ToastOptions) {
  const message = description ? `${title}: ${description}` : title;

  switch (variant) {
    case 'error':
      hotToast.error(message);
      break;
    case 'success':
      hotToast.success(message);
      break;
    default:
      hotToast(message);
  }
}
