import React from 'react';
import { Stethoscope, Scissors, Dog, Home, Star } from 'lucide-react';
import { VerificationBadge } from '../../VerificationBadge/VerificationBadge';

interface BookingProviderHeaderProps {
  providerName: string;
  providerType: 'veterinarian' | 'groomer' | 'dog_walker' | 'pet_sitter' | 'clinic';
  providerAvatar?: string;
  rating?: number;
  badgeType?: string;
}

export const BookingProviderHeader: React.FC<BookingProviderHeaderProps> = ({
  providerName,
  providerType,
  providerAvatar,
  rating = 4.9,
  badgeType,
}) => {
  const getIcon = () => {
    switch (providerType) {
      case 'groomer':
        return <Scissors size={18} color="#ec4899" />;
      case 'dog_walker':
        return <Dog size={18} color="#10b981" />;
      case 'pet_sitter':
        return <Home size={18} color="#8b5cf6" />;
      default:
        return <Stethoscope size={18} color="#0ea5e9" />;
    }
  };

  return (
    <div className="booking-provider-header">
      <div className="provider-avatar-box">
        {providerAvatar ? (
          <img src={providerAvatar} alt={providerName} className="provider-avatar-img" />
        ) : (
          <div className="provider-avatar-fallback">{getIcon()}</div>
        )}
      </div>
      <div className="provider-info-text">
        <div className="provider-name-row">
          <h4>{providerName}</h4>
          <VerificationBadge type={badgeType || providerType} />
        </div>
        <div className="provider-rating-row">
          <Star size={13} fill="#fbbf24" color="#fbbf24" />
          <span>{rating} (Verified Provider)</span>
        </div>
      </div>
    </div>
  );
};
