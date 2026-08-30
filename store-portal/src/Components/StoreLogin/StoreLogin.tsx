import React, { useState } from 'react';
import axios from 'axios';
import { ShoppingBag, Mail, Lock, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AUTH_KEY = 'petsos_store_auth_v1';

export interface StoreUser {
  id: string;
  name: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

interface StoreLoginProps {
  onLogin: (user: StoreUser) => void;
}

export const StoreLogin: React.FC<StoreLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const payload = tab === 'login'
        ? { email, password }
        : { name, email, password, role: 'store_merchant' };

      const res = await axios.post(`${API_URL}/auth/${tab === 'login' ? 'login' : 'register'}`, payload);
      const { accessToken, refreshToken } = res.data;
      const jwtPayload = JSON.parse(atob(accessToken.split('.')[1]));

      if (tab === 'login' && jwtPayload.role !== 'store_merchant') {
        setError('This account does not have store merchant access.');
        return;
      }

      const user: StoreUser = { id: jwtPayload.sub, name: jwtPayload.name, email: jwtPayload.email, role: jwtPayload.role, accessToken, refreshToken };
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      onLogin(user);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1f12 0%, #0f2d1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '1rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: 20, padding: '2.5rem 2rem', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <ShoppingBag size={30} color="#10b981" />
          </div>
          <h1 style={{ margin: '0 0 0.25rem', color: '#f8fafc', fontSize: '1.4rem', fontWeight: 800 }}>PetSOS Store Portal</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Merchant Kiosk — Order & Inventory Management</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '0.25rem' }}>
          {(['login', 'register'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none', background: tab === t ? 'rgba(16,185,129,0.2)' : 'transparent', color: tab === t ? '#10b981' : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.15s' }}>
              {t === 'login' ? 'Sign In' : 'Register Store'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {tab === 'register' && (
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: 600 }}>Store / Business Name</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0 0.85rem' }}>
                <ShoppingBag size={16} color="#94a3b8" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="PetBuy Carmel · Haifa" required style={{ flex: 1, background: 'transparent', border: 'none', color: '#f8fafc', padding: '0.75rem 0', fontSize: '0.9rem', outline: 'none' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem', fontWeight: 600 }}>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '0 0.85rem' }}>
              <Mail size={16} color="#94a3b8" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="store@example.com" required style={{ flex: 1, background: 'transparent', border: 'none', color: '#f8fafc', padding: '0.75rem 0', fontSize: '0.9rem', outline: 'none' }} />
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

          <button type="submit" disabled={isLoading} style={{ padding: '0.85rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.25rem' }}>
            {isLoading ? 'Authenticating...' : tab === 'login' ? 'Access Store Portal' : 'Create Merchant Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.72rem', marginTop: '1.5rem' }}>
          Don't have access? Contact PetSOS to claim your store listing or register above.
        </p>
      </div>
    </div>
  );
};

export function loadStoreAuth(): StoreUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
