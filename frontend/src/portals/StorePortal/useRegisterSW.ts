import { useEffect } from 'react';

export const useRegisterSW = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('[PWA] Service Worker active:', reg.scope))
          .catch((err) => console.error('[PWA] Registration failed:', err));
      });
    }
  }, []);
};
