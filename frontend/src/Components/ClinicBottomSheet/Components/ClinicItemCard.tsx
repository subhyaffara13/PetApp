import React from 'react';
import type { Clinic } from '../../../schemas';
import { getDirectionsUrl } from '../../../utils/geo';
import { Phone, Navigation, Send, Calendar, ShieldCheck, MapPin, Clock } from 'lucide-react';

interface ClinicItemCardProps {
  clinic: Clinic & { computedDist: number; isVerified: boolean };
  userLocation: { lat: number; lon: number };
  isSelected: boolean;
  onCardClick?: (clinic: Clinic) => void;
  onDispatchClick: (clinic: Clinic) => void;
  onBookVisitClick?: (clinic: Clinic) => void;
  t: (key: string, fallback?: string) => string;
}

export const ClinicItemCard: React.FC<ClinicItemCardProps> = ({
  clinic,
  isSelected,
  onCardClick,
  onDispatchClick,
  onBookVisitClick,
  t,
}) => {
  const directionsUrl = getDirectionsUrl(clinic.location.lat, clinic.location.lng);

  return (
    <div
      id={`card-${clinic.id}`}
      className={`clinic-bottom-sheet__card ${isSelected ? 'clinic-bottom-sheet__card--selected' : ''} ${clinic.isVerified ? 'clinic-card--verified' : ''}`}
      onClick={() => onCardClick && onCardClick(clinic)}
    >
      <div className="clinic-bottom-sheet__card-top">
        {/* Clinic Thumbnail / Icon */}
        <div className="clinic-thumb-wrap">
          {(clinic as any).photoUrl || (clinic as any).imageUrl ? (
            <img src={(clinic as any).photoUrl || (clinic as any).imageUrl} alt={clinic.name} className="clinic-thumb-img" />
          ) : (
            <div className="clinic-thumb-placeholder">
              <span>{clinic.isMobileVet ? '🚐' : '🏥'}</span>
            </div>
          )}
          {clinic.isVerified && (
            <div className="clinic-verified-badge" title="Verified 24/7 ER Clinic">
              <ShieldCheck size={11} color="#ffffff" />
            </div>
          )}
        </div>

        {/* Title & Metadata */}
        <div className="clinic-title-info">
          <div className="clinic-title-row">
            <h4 className="clinic-card-name">{clinic.name}</h4>
            <span className="clinic-card-dist">
              {clinic.computedDist.toFixed(1)} <span>km</span>
            </span>
          </div>

          <div className="clinic-meta-row">
            {clinic.isVerified ? (
              <span className="clinic-badge clinic-badge--er">🚨 24/7 ER</span>
            ) : clinic.isOpenNow ? (
              <span className="clinic-badge clinic-badge--open">🟢 Open Now</span>
            ) : (
              <span className="clinic-badge clinic-badge--closed">Closed</span>
            )}
            {clinic.isMobileVet && (
              <span className="clinic-badge clinic-badge--mobile">🚐 Mobile Vet</span>
            )}
            {clinic.openingHours && (
              <span className="clinic-hours-text">
                <Clock size={11} /> {clinic.openingHours}
              </span>
            )}
          </div>

          {clinic.address && (
            <p className="clinic-card-address">
              <MapPin size={12} className="clinic-pin-icon" />
              <span>{clinic.address}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="clinic-card-actions" onClick={(e) => e.stopPropagation()}>
        {clinic.phoneNum && (
          <a href={`tel:${clinic.phoneNum}`} className="btn-clinic-action btn-clinic-call">
            <Phone size={13} /> {t('emergency.btn_call', 'Call')}
          </a>
        )}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-clinic-action btn-clinic-directions"
        >
          <Navigation size={13} /> {t('emergency.btn_directions', 'Directions')}
        </a>
        {onBookVisitClick && (
          <button
            type="button"
            className="btn-clinic-action btn-clinic-book"
            onClick={() => onBookVisitClick(clinic)}
          >
            <Calendar size={13} /> Book Visit
          </button>
        )}
        <button
          type="button"
          className="btn-clinic-action btn-clinic-dispatch"
          onClick={() => onDispatchClick(clinic)}
        >
          <Send size={13} /> {t('action.dispatch', 'Dispatch Dossier')}
        </button>
      </div>
    </div>
  );
};

