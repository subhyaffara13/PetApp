import React from 'react';
import './UI.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  required,
  className = '',
  rows = 3,
  id,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="ui-form-group">
      {label && (
        <label htmlFor={textareaId} className="ui-form-label">
          {label} {required && <span className="ui-form-label-required">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        className={`ui-textarea ${error ? 'ui-textarea--error' : ''} ${className}`}
        {...props}
      />

      {error && <span className="ui-form-error">{error}</span>}
      {!error && helperText && <span className="ui-form-helper">{helperText}</span>}
    </div>
  );
};
