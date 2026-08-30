/**
 * PetSOS In-Browser Web Push Notification Helper
 * Manages notification permissions and displays system alerts for
 * emergency Lost Pet SOS, E2EE messages, and DaaS courier updates.
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
  }
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(title, {
      body: options?.body || 'PetSOS Alert',
      icon: options?.icon || '/petsos-logo.svg',
      tag: options?.tag || 'petsos_alert',
    });

    if (options?.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }
  } catch (err) {
    console.warn('Browser notification display warning:', err);
  }
}
