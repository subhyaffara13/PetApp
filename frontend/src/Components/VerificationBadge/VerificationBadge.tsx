import React from 'react';
import { ShieldCheck, Stethoscope, Store, HeartHandshake, Crown } from 'lucide-react';
import type { VerificationBadge as BadgeType } from '../../schemas';
import './VerificationBadge.css';

interface VerificationBadgeProps {
  type?: BadgeType | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  type = 'none',
  size = 'sm',
  showLabel = false,
  className = '',
}) => {
  if (!type || type === 'none') return null;

  let icon = <ShieldCheck size={size === 'sm' ? 13 : size === 'md' ? 16 : 18} />;
  let label = 'Verified';
  let badgeClass = 'badge--generic';

  if (type === 'veterinarian' || type === 'vet' || type === 'clinic_admin') {
    icon = <Stethoscope size={size === 'sm' ? 13 : size === 'md' ? 16 : 18} />;
    label = 'Verified Clinic';
    badgeClass = 'badge--vet';
  } else if (type === 'pet_store' || type === 'merchant' || type === 'store_merchant') {
    icon = <Store size={size === 'sm' ? 13 : size === 'md' ? 16 : 18} />;
    label = 'Verified Merchant';
    badgeClass = 'badge--merchant';
  } else if (type === 'animal_shelter' || type === 'shelter_org') {
    icon = <HeartHandshake size={size === 'sm' ? 13 : size === 'md' ? 16 : 18} />;
    label = 'Verified Shelter & Rescue';
    badgeClass = 'badge--shelter';
  } else if (type === 'platform_admin' || type === 'superadmin') {
    icon = <Crown size={size === 'sm' ? 13 : size === 'md' ? 16 : 18} />;
    label = 'PetSOS Staff';
    badgeClass = 'badge--admin';
  }

  return (
    <span
      className={`verified-badge verified-badge--${size} ${badgeClass} ${className}`}
      title={label}
      aria-label={label}
    >
      {icon}
      {showLabel && <span className="verified-badge__label">{label}</span>}
    </span>
  );
};
