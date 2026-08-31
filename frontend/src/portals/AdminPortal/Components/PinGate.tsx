import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { API_URL } from '../../../config/api';

const SESSION_KEY = 'petsos_admin_unlocked';

interface PinGateProps {
  children: React.ReactNode;
}

export const PinGate: React.FC<PinGateProps> = ({ children }) => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...pin];
    next[index] = value;
    setPin(next);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (next.every((d) => d !== '') && next.join('').length === 4) {
      verify(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const verify = async (code: string) => {
    try {
      await axios.get(`${API_URL}/admin/health`, { headers: { 'x-admin-token': code } });
      sessionStorage.setItem(SESSION_KEY, 'true');
      setUnlocked(true);
    } catch {
      setError(true);
      setShaking(true);
      setPin(['', '', '', '']);
      setTimeout(() => {
        setShaking(false);
        inputRefs[0].current?.focus();
      }, 600);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '2.5rem 2rem', width: 340, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <Shield size={28} color="#38bdf8" />
        </div>
        <h2 style={{ margin: '0 0 0.25rem', color: '#f8fafc', fontSize: '1.2rem', fontWeight: 800 }}>PetSOS Admin Station</h2>
        <p style={{ margin: '0 0 1.75rem', color: '#94a3b8', fontSize: '0.85rem' }}>Enter your 4-digit admin PIN to continue</p>

        <div className={shaking ? 'shake' : ''} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              style={{
                width: 56, height: 64,
                textAlign: 'center', fontSize: '1.5rem', fontWeight: 800,
                background: '#0f172a',
                border: `2px solid ${error ? '#ef4444' : digit ? '#38bdf8' : '#334155'}`,
                color: '#f8fafc', borderRadius: 10,
                outline: 'none', caretColor: 'transparent',
                transition: 'border-color 0.15s',
              }}
            />
          ))}
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
            <Lock size={13} /> Incorrect PIN. Try again.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
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
          <p style={{ color: '#475569', fontSize: '0.72rem', margin: 0 }}>
            Session-locked. Closing the browser tab will require re-authentication.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .shake { animation: shake 0.5s ease; }
      `}</style>
    </div>
  );
};
