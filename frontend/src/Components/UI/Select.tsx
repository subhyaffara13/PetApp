import React from 'react';
import { ChevronDown } from 'lucide-react';
import './UI.css';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  children,
  required,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="ui-form-group">
      {label && (
        <label htmlFor={selectId} className="ui-form-label">
          {label} {required && <span className="ui-form-label-required">*</span>}
        </label>
      )}

      <div className="ui-select-wrapper">
        <select
          id={selectId}
          className={`ui-select ${error ? 'ui-select--error' : ''} ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown size={16} className="ui-select-arrow" />
      </div>

      {error && <span className="ui-form-error">{error}</span>}
    </div>
  );
};
