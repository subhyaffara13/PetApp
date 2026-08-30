import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface LostPetAlertData {
  _id: string;
  petName: string;
  petBreed: string;
  petAvatar?: string;
  ownerName: string;
  ownerPhone: string;
  lastSeenLocation: string;
  lastSeenCoordinates: { lat: number; lon: number };
  createdAt: string;
}

export const LostPetNotificationTicker: React.FC = () => {
  const [alerts, setAlerts] = useState<LostPetAlertData[]>([]);
  const [currentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      try {
        const res = await axios.get<LostPetAlertData[]>(`${API_URL}/emergency/lost-pet`);
        if (res.data && res.data.length > 0) {
          setAlerts(res.data);
        }
      } catch {}
    };

    fetchActiveAlerts();
    const interval = setInterval(fetchActiveAlerts, 45000);
    return () => clearInterval(interval);
  }, []);

  if (isDismissed || alerts.length === 0) return null;

  const current = alerts[currentIndex % alerts.length];

  return (
    <div
      style={{
        position: 'fixed',
        top: 64,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 990,
        maxWidth: 560,
        width: 'calc(100% - 2rem)',
        background: 'linear-gradient(135deg, rgba(239,68,68,0.92), rgba(185,28,28,0.95))',
        color: '#ffffff',
        borderRadius: 14,
        padding: '0.45rem 0.85rem',
        boxShadow: '0 8px 24px rgba(239,68,68,0.35)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        animation: 'slideDown 0.3s ease',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AlertCircle size={18} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <strong style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            Lost Pet Alert: {current.petName} ({current.petBreed})
          </strong>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '0.72rem',
            opacity: 0.95,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          📍 Last seen: {current.lastSeenLocation} · Call {current.ownerPhone}
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          navigate('/emergency');
        }}
        style={{
          background: '#ffffff',
          color: '#b91c1c',
          border: 'none',
          borderRadius: 6,
          padding: '3px 8px',
          fontSize: '0.72rem',
          fontWeight: 800,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
        }}
      >
        View Map <ChevronRight size={12} />
      </button>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer',
          padding: 2,
        }}
        title="Dismiss Alert"
      >
        <X size={14} />
      </button>
    </div>
  );
};
