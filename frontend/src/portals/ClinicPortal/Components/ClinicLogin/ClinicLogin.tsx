import React, { useState } from 'react';
import axios from 'axios';
import { Stethoscope, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { API_URL } from '../../../../config/api';

const AUTH_KEY = 'petsos_clinic_auth_v1';

export interface ClinicUser {
  id: string;
  name: string;
  email: string;
  role: string;
  practiceType?: 'stationary_clinic' | 'mobile_vet' | 'none';
  accessToken: string;
  refreshToken: string;
}

interface ClinicLoginProps {
  onLogin: (user: ClinicUser) => void;
}

export const ClinicLogin: React.FC<ClinicLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [practiceType, setPracticeType] = useState<'stationary_clinic' | 'mobile_vet'>('stationary_clinic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const payload = tab === 'login'
        ? { email, password }
        : { name, email, password, role: 'clinic_admin', practiceType };

      const res = await axios.post(`${API_URL}/auth/${tab === 'login' ? 'login' : 'register'}`, payload);
      const { accessToken, refreshToken } = res.data;

      if (tab === 'register' && res.data?.role !== 'clinic_admin') {
        setError('This account does not have clinic admin access.');
        return;
      }

      // Decode payload
      const jwtPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const allowedRoles = ['clinic_admin', 'shelter_org', 'superadmin'];
      if (tab === 'login' && !allowedRoles.includes(jwtPayload.role)) {
        setError('This account does not have clinical or shelter medical access.');
        return;
      }

      const user: ClinicUser = {
        id: jwtPayload.sub,
        name: jwtPayload.name,
        email: jwtPayload.email,
        role: jwtPayload.role,
        practiceType: jwtPayload.practiceType || practiceType,
        accessToken,
        refreshToken,
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      onLogin(user);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a1628 0%, #0f2744 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '1rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: '2.5rem 2rem', width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Stethoscope size={30} color="#38bdf8" />
          </div>
          <h1 style={{ margin: '0 0 0.25rem', color: '#f8fafc', fontSize: '1.4rem', fontWeight: 800 }}>PetSOS Clinic Station</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>PIMS — Physical Clinics & Mobile Ambulatory Vets</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '0.25rem' }}>
          {(['login', 'register'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none', background: tab === t ? 'rgba(56,189,248,0.2)' : 'transparent', color: tab === t ? '#38bdf8' : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.15s' }}>
              {t === 'login' ? 'Sign In' : 'Register Clinic / Mobile Vet'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {tab === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.35rem', fontWeight: 600 }}>Practice Operational Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPracticeType('stationary_clinic')}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 10,
                      border: practiceType === 'stationary_clinic' ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      background: practiceType === 'stationary_clinic' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                      color: practiceType === 'stationary_clinic' ? '#38bdf8' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <span>🏥 Physical Clinic</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 400 }}>Fixed Address / ICU</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPracticeType('mobile_vet')}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 10,
                      border: practiceType === 'mobile_vet' ? '1.5px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                      background: practiceType === 'mobile_vet' ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.03)',
                      color: practiceType === 'mobile_vet' ? '#f472b6' : '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <span>🚐 On-The-Move Vet</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 400 }}>Live GPS / House Calls</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: 600 }}>
                  {practiceType === 'mobile_vet' ? 'Doctor / Mobile Service Name' : 'Clinic / Practice Name'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0 0.85rem' }}>
                  <Stethoscope size={16} color="#94a3b8" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={practiceType === 'mobile_vet' ? 'Dr. Sarah Cohen — Mobile Vet Unit' : 'Carmel Veterinary Emergency Hospital'}
                    required
                    style={{ flex: 1, background: 'transparent', border: 'none', color: '#f8fafc', padding: '0.75rem 0', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: 600 }}>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0 0.85rem' }}>
              <Mail size={16} color="#94a3b8" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="clinic@example.com" required style={{ flex: 1, background: 'transparent', border: 'none', color: '#f8fafc', padding: '0.75rem 0', fontSize: '0.9rem', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: 600 }}>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0 0.85rem' }}>
              <Lock size={16} color="#94a3b8" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} style={{ flex: 1, background: 'transparent', border: 'none', color: '#f8fafc', padding: '0.75rem 0', fontSize: '0.9rem', outline: 'none' }} />
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.6rem 0.85rem', color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} style={{ padding: '0.85rem', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', color: '#0f172a', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.25rem' }}>
            {isLoading ? 'Authenticating...' : tab === 'login' ? 'Access Clinic Portal' : 'Create Clinic Account'}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#38bdf8',
              textDecoration: 'none',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={14} /> Back to PetSOS Customer App
          </a>
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.72rem', margin: 0 }}>
            Don't have an account yet? Contact PetSOS to claim your clinic listing or register above.
          </p>
        </div>
      </div>
    </div>
  );
};

export function loadClinicAuth(): ClinicUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
