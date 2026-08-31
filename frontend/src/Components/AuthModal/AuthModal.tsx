import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ShieldAlert, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2, Circle, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config/api';
import './AuthModal.css';

declare global {
  interface Window {
    google?: any;
  }
}

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export const AuthModal = () => {
  const { showAuthModal, openAuthModal, closeAuthModal, login, register, oauthLogin, redirectPath } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

  // Auto-detect ?resetToken=... and ?resetEmail=... from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    const resetEmail = params.get('resetEmail');
    if (token && resetEmail) {
      setResetToken(token);
      setEmail(decodeURIComponent(resetEmail));
      setMode('reset');
      openAuthModal();
      // Clean query params from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Password Complexity Evaluation
  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  const isComplex = hasLength && hasLetter && hasNumber && hasSpecial;
  const isMatching = confirmPassword.length > 0 && password === confirmPassword;

  // Official Google OAuth2 Native Popup Sign-In
  const handleGoogleSignIn = () => {
    if (!googleClientId) {
      setError('Google Client ID is not configured in .env');
      return;
    }

    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setError('Google Sign-In was cancelled.');
              return;
            }

            if (tokenResponse?.access_token) {
              setIsLoading(true);
              setError(null);
              try {
                const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const { name: gName, email: gEmail, picture: gAvatar } = res.data;

                await oauthLogin(
                  gName || 'Google User',
                  gEmail,
                  gAvatar || '',
                  'customer'
                );
                closeAuthModal();
                showToast(`Welcome back, ${gName || 'Pet Parent'}!`, 'success', '👋 Signed In');
              } catch (err: any) {
                console.error('Google profile retrieval error:', err);
                setError('Failed to authenticate Google user with backend.');
              } finally {
                setIsLoading(false);
              }
            }
          },
        });
        client.requestAccessToken({ prompt: 'select_account' });
      } catch (err: any) {
        console.error('Google OAuth init error:', err);
        setError('Google OAuth popup initialization failed. Please try again.');
      }
    } else {
      setError('Google Identity SDK is loading. Please try again in a moment.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your account email address.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email: email.trim() });
      setSuccessMessage(res.data?.message || 'Password reset link sent to your email.');
      if (res.data?.resetLink) {
        // Provide clickable link directly for local dev convenience
        setResetToken(new URL(res.data.resetLink).searchParams.get('resetToken') || '');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to dispatch password reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplex) {
      setError('Please fulfill all password requirements before proceeding.');
      return;
    }
    if (!isMatching) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        token: resetToken,
        email: email.trim(),
        newPassword: password,
      });
      showToast(res.data?.message || 'Password reset successfully!', 'success', '🔒 Password Updated');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password reset successfully. You can now sign in with your new password.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Password reset failed or token expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'register') {
      if (!isComplex) {
        setError('Please fulfill all password requirements (8+ chars, letter, number, special char).');
        return;
      }
      if (!isMatching) {
        setError('Passwords do not match.');
        return;
      }
    }

    setError(null);
    setIsLoading(true);
    try {
      if (mode === 'register') {
        await register(name.trim() || 'Pet Owner', email.trim(), password);
        showToast('Account created successfully!', 'success', '🎉 Welcome');
      } else {
        await login(email.trim(), password);
        showToast('Signed in successfully!', 'success', '👋 Welcome Back');
      }
      closeAuthModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (mode === 'login' && (err?.response?.status === 401 || err?.response?.status === 404)) {
        setError('Incorrect email or password. If you do not have an account, please register.');
      } else {
        setError(msg || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!showAuthModal) return null;

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal} id="auth-modal-overlay">
      <div className="auth-modal card animate-scale-up" onClick={(e) => e.stopPropagation()} id="auth-modal-card">
        {/* Header */}
        <div className="auth-modal__header">
          <div className="auth-modal__brand">
            <span className="auth-modal__logo">🐾</span>
            <div>
              <h3>
                {mode === 'login' && 'Sign in to PetSOS'}
                {mode === 'register' && 'Create PetSOS Account'}
                {mode === 'forgot' && 'Reset Your Password'}
                {mode === 'reset' && 'Create New Password'}
              </h3>
              <p className="auth-modal__subtitle">
                {mode === 'login' && (redirectPath ? `Sign in to access ${redirectPath.toUpperCase()}` : 'Access AI Assistant, Pet Profiles & Community')}
                {mode === 'register' && 'Join thousands of pet owners with 24/7 care'}
                {mode === 'forgot' && "Enter your email and we'll send you a secure reset link"}
                {mode === 'reset' && 'Choose a strong, encrypted password for your account'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={closeAuthModal}
            id="auth-modal-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Emergency Notice */}
        <div className="auth-modal__notice">
          <ShieldAlert size={14} />
          <span>
            Emergency hospital maps & hotlines are <strong>always 100% free</strong> without logging in.
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-modal__error" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                style={{ alignSelf: 'flex-start', background: 'var(--color-primary)', color: '#0f172a', border: 'none', borderRadius: 4, padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                → Create Free Account
              </button>
            )}
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, fontSize: '0.8rem', color: '#10b981', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} /> {successMessage}
            </div>
            {mode === 'forgot' && resetToken && (
              <button
                type="button"
                onClick={() => { setMode('reset'); setError(null); setSuccessMessage(null); }}
                style={{ alignSelf: 'flex-start', background: '#10b981', color: '#0f172a', border: 'none', borderRadius: 6, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: 2 }}
              >
                → Click here to Enter New Password Now
              </button>
            )}
          </div>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} className="auth-modal__form">
            <div className="auth-input-group">
              <Mail size={16} />
              <input
                type="email"
                className="input"
                placeholder="Enter your registered email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              <span>{isLoading ? 'Checking database...' : 'Send Reset Link'}</span>
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD MODE (Two Matching Inputs & Complexity Guidance) */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPasswordSubmit} className="auth-modal__form">
            <div className="auth-input-group">
              <Mail size={16} />
              <input
                type="email"
                className="input"
                value={email}
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>

            <div className="auth-input-group">
              <KeyRound size={16} />
              <input
                type="password"
                className="input"
                placeholder="New Password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Live Password Complexity Checklist */}
            <div className="password-requirements-box">
              <span className="password-requirements-title">Password Requirements:</span>
              <div className={`password-requirement-item ${hasLength ? 'valid' : ''}`}>
                {hasLength ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                At least 8 characters
              </div>
              <div className={`password-requirement-item ${hasLetter ? 'valid' : ''}`}>
                {hasLetter ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                At least 1 letter (a-z, A-Z)
              </div>
              <div className={`password-requirement-item ${hasNumber ? 'valid' : ''}`}>
                {hasNumber ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                At least 1 number (0-9)
              </div>
              <div className={`password-requirement-item ${hasSpecial ? 'valid' : ''}`}>
                {hasSpecial ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                At least 1 special character (!@#$%^&*...)
              </div>
            </div>

            {/* Second Password Input for Confirmation */}
            <div className="auth-input-group">
              <Lock size={16} />
              <input
                type="password"
                className="input"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {confirmPassword.length > 0 && (
              <div className={`password-match-badge ${isMatching ? 'match' : 'mismatch'}`}>
                {isMatching ? <Check size={12} /> : <AlertCircle size={12} />}
                {isMatching ? 'Passwords match' : 'Passwords do not match'}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading || !isComplex || !isMatching}>
              <span>{isLoading ? 'Saving encrypted password...' : 'Update & Encrypt Password'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* LOGIN & REGISTER MODES */}
        {(mode === 'login' || mode === 'register') && (
          <>
            {/* Google 1-Click Sign-In */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', width: '100%' }}>
              <button
                type="button"
                className="social-btn social-btn--google"
                onClick={handleGoogleSignIn}
                style={{ width: '100%', justifyContent: 'center' }}
                id="login-google-btn"
                disabled={isLoading}
              >
                <svg className="social-btn__icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>
            </div>

            <div className="auth-modal__divider">
              <span>OR WITH EMAIL</span>
            </div>

            {/* Email Form */}
            <form className="auth-modal__form" onSubmit={handleSubmit} id="auth-email-form">
              {mode === 'register' && (
                <div className="auth-input-group">
                  <UserIcon size={16} />
                  <input
                    type="text"
                    className="input"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="auth-name-input"
                    required
                  />
                </div>
              )}

              <div className="auth-input-group">
                <Mail size={16} />
                <input
                  type="email"
                  className="input"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="auth-email-input"
                  required
                />
              </div>

              <div className="auth-input-group">
                <Lock size={16} />
                <input
                  type="password"
                  className="input"
                  placeholder={mode === 'register' ? 'Password (min 8 chars)' : 'Password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="auth-password-input"
                  required
                />
              </div>

              {/* Password Complexity Checklist for Registration */}
              {mode === 'register' && (
                <>
                  <div className="password-requirements-box">
                    <span className="password-requirements-title">Password Requirements:</span>
                    <div className={`password-requirement-item ${hasLength ? 'valid' : ''}`}>
                      {hasLength ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                      At least 8 characters
                    </div>
                    <div className={`password-requirement-item ${hasLetter ? 'valid' : ''}`}>
                      {hasLetter ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                      At least 1 letter (a-z, A-Z)
                    </div>
                    <div className={`password-requirement-item ${hasNumber ? 'valid' : ''}`}>
                      {hasNumber ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                      At least 1 number (0-9)
                    </div>
                    <div className={`password-requirement-item ${hasSpecial ? 'valid' : ''}`}>
                      {hasSpecial ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                      At least 1 special character (!@#$%^&*...)
                    </div>
                  </div>

                  {/* Second Confirmation Input */}
                  <div className="auth-input-group">
                    <Lock size={16} />
                    <input
                      type="password"
                      className="input"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {confirmPassword.length > 0 && (
                    <div className={`password-match-badge ${isMatching ? 'match' : 'mismatch'}`}>
                      {isMatching ? <Check size={12} /> : <AlertCircle size={12} />}
                      {isMatching ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  )}
                </>
              )}

              {/* Forgot Password Link on Login Form */}
              {mode === 'login' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccessMessage(null); }}
                    style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                id="auth-submit-btn"
                disabled={isLoading || (mode === 'register' && (!isComplex || !isMatching))}
              >
                <span>{isLoading ? 'Processing...' : mode === 'register' ? 'Create Free Account' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Toggle Register/Login */}
            <div className="auth-modal__footer">
              <p>
                {mode === 'register' ? 'Already have an account?' : "Don't have an account yet?"}
                <button
                  type="button"
                  className="auth-modal__toggle-btn"
                  onClick={() => {
                    setMode(mode === 'register' ? 'login' : 'register');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  id="auth-toggle-mode-btn"
                >
                  {mode === 'register' ? 'Sign In' : 'Register Free'}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
