import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      {...props}
    >
      {title && <h3 className="text-lg font-semibold mb-4 text-gray-600">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;