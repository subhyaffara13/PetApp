import React from 'react';
import './UI.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${fullWidth ? 'ui-btn--full' : ''} ${isLoading ? 'ui-btn--loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="ui-btn-spinner" />
      ) : (
        <>
          {leftIcon && <span className="ui-btn-icon-left">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="ui-btn-icon-right">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
