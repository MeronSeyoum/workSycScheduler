// components/ui/Avatar.tsx
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', className }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  return (
    <div className={cn(
      "rounded-full bg-teal-700 text-white flex items-center justify-center font-medium",
      sizeClasses[size],
      className
    )}>
      {src ? (
        <Image 
          src={src} 
          alt={name}
          width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          className="rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
};

export default Avatar;