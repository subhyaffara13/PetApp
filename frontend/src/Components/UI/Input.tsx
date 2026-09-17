import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './UI.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  inlaid?: boolean;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  required,
  inlaid = false,
  showPasswordToggle = true,
  className = '',
  id,
  type = 'text',
  value,
  placeholder,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const hasValue = value !== undefined && value !== null && String(value).length > 0;

  return (
    <div className={`ui-form-group ${inlaid ? 'ui-form-group--inlaid' : ''} ${hasValue ? 'has-value' : ''}`}>
      {label && !inlaid && (
        <label htmlFor={inputId} className="ui-form-label">
          {label} {required && <span className="ui-form-label-required">*</span>}
        </label>
      )}

      <div className="ui-input-wrapper">
        {leftIcon && <span className="ui-input-left-icon">{leftIcon}</span>}
        <input
          id={inputId}
          type={effectiveType}
          value={value}
          placeholder={inlaid ? ' ' : placeholder}
          className={`ui-input ${inlaid ? 'ui-input--inlaid' : ''} ${leftIcon ? 'ui-input--has-left-icon' : ''} ${
            rightIcon || (isPassword && showPasswordToggle) ? 'ui-input--has-right-icon' : ''
          } ${error ? 'ui-input--error' : ''} ${className}`}
          {...props}
        />
        {label && inlaid && (
          <label htmlFor={inputId} className="ui-inlaid-label">
            {label} {required && <span className="ui-form-label-required">*</span>}
          </label>
        )}
        {isPassword && showPasswordToggle ? (
          <button
            type="button"
            className="ui-input-eye-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : (
          rightIcon && <span className="ui-input-right-icon">{rightIcon}</span>
        )}
      </div>

      {error && <span className="ui-form-error">{error}</span>}
      {!error && helperText && <span className="ui-form-helper">{helperText}</span>}
    </div>
  );
};
