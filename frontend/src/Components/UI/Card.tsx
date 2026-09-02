import React from 'react';
import './UI.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`ui-card ${hoverable ? 'ui-card--hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
