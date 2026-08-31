import { useEffect, useState } from 'react';

/**
 * HTML5 Screen Wake Lock API to prevent tablets and counter devices from sleeping
 */
export const useWakeLock = () => {
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    let wakeLock: any = null;

    const requestLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          setIsLocked(true);
        } catch {}
      }
    };

    requestLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestLock();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) wakeLock.release();
    };
  }, []);

  return isLocked;
};
