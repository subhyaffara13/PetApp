import React from 'react';
import { User as UserIcon, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface RegisterFormProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  hasLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isMatching: boolean;
  isComplex: boolean;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  hasLength,
  hasLetter,
  hasNumber,
  hasSpecial,
  isMatching,
  isComplex,
  isLoading,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="auth-modal-form">
      <div className="auth-field">
        <label>Full Name</label>
        <div className="auth-input-wrapper">
          <UserIcon size={18} className="auth-input-icon" />
          <input
            type="text"
            placeholder="Sarah Cohen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
      </div>

      <div className="auth-field">
        <label>Email Address</label>
        <div className="auth-input-wrapper">
          <Mail size={18} className="auth-input-icon" />
          <input
            type="email"
            placeholder="parent@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="auth-field">
        <label>New Password</label>
        <div className="auth-input-wrapper">
          <Lock size={18} className="auth-input-icon" />
          <input
            type="password"
            placeholder="Min. 8 chars, 1 number, 1 symbol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      {password.length > 0 && (
        <PasswordStrengthIndicator
          hasLength={hasLength}
          hasLetter={hasLetter}
          hasNumber={hasNumber}
          hasSpecial={hasSpecial}
        />
      )}

      <div className="auth-field">
        <label>Confirm Password</label>
        <div className="auth-input-wrapper">
          <Lock size={18} className="auth-input-icon" />
          <input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {isMatching && (
            <CheckCircle2 size={18} color="#10b981" style={{ marginRight: '10px' }} />
          )}
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary auth-submit-btn"
        disabled={isLoading || !isComplex || !isMatching}
      >
        {isLoading ? (
          <span className="auth-spinner" />
        ) : (
          <>
            Create Account <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
};
