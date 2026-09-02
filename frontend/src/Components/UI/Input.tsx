import React from 'react';
import './UI.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  required,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="ui-form-group">
      {label && (
        <label htmlFor={inputId} className="ui-form-label">
          {label} {required && <span className="ui-form-label-required">*</span>}
        </label>
      )}

      <div className="ui-input-wrapper">
        {leftIcon && <span className="ui-input-left-icon">{leftIcon}</span>}
        <input
          id={inputId}
          className={`ui-input ${leftIcon ? 'ui-input--has-left-icon' : ''} ${rightIcon ? 'ui-input--has-right-icon' : ''} ${error ? 'ui-input--error' : ''} ${className}`}
          {...props}
        />
        {rightIcon && <span className="ui-input-right-icon">{rightIcon}</span>}
      </div>

      {error && <span className="ui-form-error">{error}</span>}
      {!error && helperText && <span className="ui-form-helper">{helperText}</span>}
    </div>
  );
};
