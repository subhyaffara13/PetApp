import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface PasswordStrengthProps {
  hasLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({
  hasLength,
  hasLetter,
  hasNumber,
  hasSpecial,
}) => {
  return (
    <div className="auth-rules-checklist">
      <div className={`auth-rule-item ${hasLength ? 'valid' : ''}`}>
        {hasLength ? <CheckCircle2 size={13} color="#10b981" /> : <Circle size={13} color="#64748b" />}
        <span>At least 8 characters</span>
      </div>
      <div className={`auth-rule-item ${hasLetter ? 'valid' : ''}`}>
        {hasLetter ? <CheckCircle2 size={13} color="#10b981" /> : <Circle size={13} color="#64748b" />}
        <span>Letters (A-Z, a-z)</span>
      </div>
      <div className={`auth-rule-item ${hasNumber ? 'valid' : ''}`}>
        {hasNumber ? <CheckCircle2 size={13} color="#10b981" /> : <Circle size={13} color="#64748b" />}
        <span>At least one number (0-9)</span>
      </div>
      <div className={`auth-rule-item ${hasSpecial ? 'valid' : ''}`}>
        {hasSpecial ? <CheckCircle2 size={13} color="#10b981" /> : <Circle size={13} color="#64748b" />}
        <span>Special symbol (!@#$%^&*)</span>
      </div>
    </div>
  );
};
