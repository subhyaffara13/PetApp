import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  onSubmit,
  onForgotPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="auth-modal-form">
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
            autoFocus
          />
        </div>
      </div>

      <div className="auth-field">
        <div className="auth-label-row">
          <label>Password</label>
          <button
            type="button"
            className="auth-link-btn"
            onClick={onForgotPassword}
          >
            Forgot Password?
          </button>
        </div>
        <div className="auth-input-wrapper">
          <Lock size={18} className="auth-input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
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

      <button
        type="submit"
        className="btn btn-primary auth-submit-btn"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="auth-spinner" />
        ) : (
          <>
            Sign In <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
};
