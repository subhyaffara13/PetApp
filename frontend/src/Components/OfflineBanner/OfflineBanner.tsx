import React, { useState, useEffect } from 'react';
import { WifiOff, PhoneCall } from 'lucide-react';
import './OfflineBanner.css';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-banner animate-slide-down" role="alert">
      <div className="offline-banner-content">
        <WifiOff size={16} color="#f59e0b" />
        <span>
          <strong>📡 You are currently offline.</strong> Emergency vet hotline numbers and cached pet passports remain accessible locally.
        </span>
        <a href="tel:+972549981122" className="btn-offline-sos">
          <PhoneCall size={13} /> Call Vet ER Hotline (+972-54-998-1122)
        </a>
      </div>
    </div>
  );
};
