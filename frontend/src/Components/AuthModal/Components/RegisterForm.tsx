import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Phone, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface RegisterFormProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
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
  phone,
  setPhone,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <label>Phone Number</label>
        <div className="auth-input-wrapper">
          <Phone size={18} className="auth-input-icon" />
          <input
            type="tel"
            placeholder="e.g. 054-123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="auth-field">
        <label>New Password</label>
        <div className="auth-input-wrapper">
          <Lock size={18} className="auth-input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 chars, 1 number, 1 symbol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="auth-eye-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
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
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="auth-eye-btn"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            style={isMatching ? { right: '36px' } : undefined}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {isMatching && (
            <CheckCircle2 size={18} color="#10b981" style={{ marginRight: '10px' }} />
          )}
        </div>
        {confirmPassword.length > 0 && !isMatching && (
          <span style={{ color: '#fca5a5', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
            Passwords do not match
          </span>
        )}
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
