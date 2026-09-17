import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL, GOOGLE_CLIENT_ID } from '../../config/api';
import { LoginForm } from './Components/LoginForm';
import { RegisterForm } from './Components/RegisterForm';
import { ForgotResetForm } from './Components/ForgotResetForm';
import './AuthModal.css';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export const AuthModal = () => {
  const { showAuthModal, authModalInitialMode, openAuthModal, closeAuthModal, login, register, oauthLogin, redirectPath } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthMode>(authModalInitialMode || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const googleClientId = GOOGLE_CLIENT_ID;

  // Sync mode when modal is triggered with a specific initialMode
  useEffect(() => {
    if (showAuthModal && authModalInitialMode) {
      setMode(authModalInitialMode);
      setError(null);
      setSuccessMessage(null);
    }
  }, [showAuthModal, authModalInitialMode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    const resetEmail = params.get('resetEmail');
    if (token && resetEmail) {
      setResetToken(token);
      setEmail(decodeURIComponent(resetEmail));
      setMode('reset');
      openAuthModal();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [openAuthModal]);

  const hasLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
  const isComplex = hasLength && hasLetter && hasNumber && hasSpecial;
  const isMatching = confirmPassword.length > 0 && password === confirmPassword;

  const handleGoogleSignIn = () => {
    setError(null);
    setSuccessMessage(null);
    if (!googleClientId) {
      setError('Google Client ID is not configured.');
      return;
    }
    if ((window as any).google?.accounts?.oauth2) {
      try {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              setIsLoading(true);
              try {
                const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const { name: gName, email: gEmail, picture: gAvatar } = res.data;
                await oauthLogin(gName || 'Google User', gEmail, gAvatar || '', 'customer');
                setSuccessMessage(`Google Authentication Successful! Welcome, ${gName || 'Pet Parent'}.`);
                setTimeout(() => {
                  closeAuthModal();
                  showToast(`Welcome back, ${gName || 'Pet Parent'}!`, 'success', '👋 Signed In');
                }, 1200);
              } catch (oauthErr: any) {
                const rawMsg = oauthErr?.response?.data?.message || oauthErr?.message || 'Failed to authenticate Google user.';
                const msg = Array.isArray(rawMsg) ? rawMsg.join('. ') : rawMsg;
                setError(`Google Sign-In Failed: ${msg}`);
              } finally {
                setIsLoading(false);
              }
            } else if (tokenResponse?.error) {
              setError(`Google Sign-In Error: ${tokenResponse.error_description || tokenResponse.error}`);
            }
          },
        });
        client.requestAccessToken({ prompt: 'select_account' });
      } catch (err: any) {
        setError(err?.message || 'Failed to initialize Google Sign-In.');
      }
    } else {
      setError('Google Identity Services SDK is loading or blocked. Please check your browser popup blocker.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await login(email, password);
      closeAuthModal();
      showToast('Signed in successfully!', 'success', '🐾 Welcome');
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || err?.message || 'Invalid email or password.';
      const msg = Array.isArray(rawMsg) ? rawMsg.join('. ') : rawMsg;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await register(name, email, password, 'customer', phone);
      setSuccessMessage('🎉 User account created successfully! Saved to PetSOS Atlas database. Logging you in...');
      setTimeout(() => {
        closeAuthModal();
        showToast('Account created successfully! Welcome to PetSOS.', 'success', '🎉 Welcome');
      }, 1600);
    } catch (err: any) {
      const rawMsg = err?.response?.data?.message || err?.message || 'Registration failed.';
      const msg = Array.isArray(rawMsg) ? rawMsg.join('. ') : rawMsg;
      setError(`Registration Failed: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccessMessage(res.data?.message || 'Password reset link sent to your email.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token: resetToken, newPassword: password });
      setSuccessMessage('Password reset successfully! Logging you in...');
      setTimeout(async () => {
        await login(email, password);
        closeAuthModal();
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reset password. Link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showAuthModal) return null;

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div className="auth-modal-card card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-brand-group">
            <span className="auth-paw-icon">🐾</span>
            <div>
              <h3 className="auth-title">
                {mode === 'login' ? 'Sign In to PetSOS' : mode === 'register' ? 'Create Your Account' : mode === 'forgot' ? 'Reset Password' : 'New Password'}
              </h3>
              <p className="auth-sub">
                {redirectPath ? 'Sign in to access this feature' : 'Health passports & emergency veterinary access'}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={closeAuthModal}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <span>{error}</span>
              {mode === 'login' && error.toLowerCase().includes('register') && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                    fontWeight: 600,
                  }}
                >
                  Create Account with this email →
                </button>
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="auth-success-banner">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {mode !== 'forgot' && mode !== 'reset' && (
          <div className="auth-mode-toggle">
            <button className={`auth-toggle-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(null); }}>
              Sign In
            </button>
            <button className={`auth-toggle-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(null); }}>
              Create Account
            </button>
          </div>
        )}

        {mode === 'login' && (
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoading={isLoading}
            onSubmit={handleLoginSubmit}
            onForgotPassword={() => { setMode('forgot'); setError(null); setSuccessMessage(null); }}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            hasLength={hasLength}
            hasLetter={hasLetter}
            hasNumber={hasNumber}
            hasSpecial={hasSpecial}
            isMatching={isMatching}
            isComplex={isComplex}
            isLoading={isLoading}
            onSubmit={handleRegisterSubmit}
          />
        )}

        {(mode === 'forgot' || mode === 'reset') && (
          <ForgotResetForm
            mode={mode}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            hasLength={hasLength}
            hasLetter={hasLetter}
            hasNumber={hasNumber}
            hasSpecial={hasSpecial}
            isMatching={isMatching}
            isComplex={isComplex}
            isLoading={isLoading}
            onForgotSubmit={handleForgotSubmit}
            onResetSubmit={handleResetSubmit}
            onBackToLogin={() => { setMode('login'); setError(null); }}
          />
        )}

        {mode !== 'forgot' && mode !== 'reset' && (
          <div className="auth-oauth-section">
            <div className="auth-divider"><span>OR CONTINUE WITH</span></div>
            <button type="button" className="btn btn-secondary auth-google-btn" onClick={handleGoogleSignIn} disabled={isLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
