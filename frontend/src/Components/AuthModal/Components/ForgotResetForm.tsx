import React from 'react';
import { Mail, Lock, KeyRound, CheckCircle2 } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface ForgotResetFormProps {
  mode: 'forgot' | 'reset';
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
  onForgotSubmit: (e: React.FormEvent) => void;
  onResetSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

export const ForgotResetForm: React.FC<ForgotResetFormProps> = ({
  mode,
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
  onForgotSubmit,
  onResetSubmit,
  onBackToLogin,
}) => {
  if (mode === 'forgot') {
    return (
      <form onSubmit={onForgotSubmit} className="auth-modal-form">
        <p className="auth-forgot-desc">
          Enter your registered email address and we'll send you a secure link to reset your password.
        </p>

        <div className="auth-field">
          <label>Account Email</label>
          <div className="auth-input-wrapper">
            <Mail size={18} className="auth-input-icon" />
            <input
              type="email"
              placeholder="parent@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary auth-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? <span className="auth-spinner" /> : 'Send Reset Link'}
        </button>

        <div className="auth-footer-toggle">
          <button
            type="button"
            className="auth-link-btn"
            onClick={onBackToLogin}
          >
            ← Back to Sign In
          </button>
        </div>
      </form>
    );
  }

  // mode === 'reset'
  return (
    <form onSubmit={onResetSubmit} className="auth-modal-form">
      <div className="auth-reset-banner">
        <KeyRound size={16} />
        <span>Resetting password for: <strong>{email}</strong></span>
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
            autoFocus
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
        <label>Confirm New Password</label>
        <div className="auth-input-wrapper">
          <Lock size={18} className="auth-input-icon" />
          <input
            type="password"
            placeholder="Re-enter new password"
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
        {isLoading ? <span className="auth-spinner" /> : 'Set New Password & Sign In'}
      </button>
    </form>
  );
};
