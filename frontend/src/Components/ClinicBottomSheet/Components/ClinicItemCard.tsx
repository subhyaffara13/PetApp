import React from 'react';
import type { Clinic } from '../../../schemas';
import { getDirectionsUrl } from '../../../utils/geo';
import { Phone, Navigation, Send, Calendar } from 'lucide-react';

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
      className={`clinic-bottom-sheet__card ${isSelected ? 'clinic-bottom-sheet__card--selected' : ''}`}
      onClick={() => onCardClick && onCardClick(clinic)}
    >
      <div className="clinic-bottom-sheet__card-header">
        <div className="clinic-title-row">
          <span className="clinic-type-symbol">{clinic.isMobileVet ? '🚐' : '🏥'}</span>
          <h4 className="clinic-bottom-sheet__card-name">{clinic.name}</h4>
        </div>
        <span className="clinic-bottom-sheet__distance">
          {clinic.computedDist.toFixed(1)} km
        </span>
      </div>

      <p className="clinic-bottom-sheet__address">{clinic.address}</p>

      <div className="clinic-bottom-sheet__tags">
        {clinic.isVerified ? (
          <span className="badge badge--success">{t('emergency.tag_verified_er', 'VERIFIED 24/7 ER')}</span>
        ) : clinic.isOpenNow ? (
          <span className="badge badge--info">{t('emergency.tag_community_open', 'COMMUNITY VET · OPEN NOW')}</span>
        ) : (
          <span className="badge badge--warning">{t('emergency.tag_closed', 'CLOSED NOW')}</span>
        )}
      </div>

      <div className="clinic-bottom-sheet__actions" onClick={(e) => e.stopPropagation()}>
        {clinic.phoneNum && (
          <a href={`tel:${clinic.phoneNum}`} className="btn btn-secondary btn-sm">
            <Phone size={14} /> {t('emergency.btn_call', 'Call')}
          </a>
        )}
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
          <Navigation size={14} /> {t('emergency.btn_directions', 'Directions')}
        </a>
        {onBookVisitClick && (
          <button className="btn btn-secondary btn-sm btn-book-visit" onClick={() => onBookVisitClick(clinic)}>
            <Calendar size={13} color="#38bdf8" /> Book Visit
          </button>
        )}
        <button className="btn btn-primary btn-sm btn-dispatch-dossier" onClick={() => onDispatchClick(clinic)}>
          <Send size={13} /> {t('action.dispatch', 'Dispatch Dossier')}
        </button>
      </div>
    </div>
  );
};
