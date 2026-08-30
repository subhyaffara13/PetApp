import type { Clinic } from '../../schemas';
import { Phone, Navigation, Clock, X, ChevronUp } from 'lucide-react';
import './ClinicDrawer.css';

interface ClinicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clinics: Clinic[];
  selectedClinic: Clinic | null;
  onClinicSelect: (clinic: Clinic) => void;
}

const getGoogleMapsUrl = (address: string): string => {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
};

const ClinicCard = ({
  clinic,
  isSelected,
  onClick,
}: {
  clinic: Clinic;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const capacityLabel =
    clinic.capacityStatus === 'at_capacity'
      ? 'At Capacity'
      : clinic.capacityStatus === 'limited'
        ? 'Limited'
        : 'Accepting';
  const capacityClass =
    clinic.capacityStatus === 'at_capacity'
      ? 'badge-closed'
      : clinic.capacityStatus === 'limited'
        ? 'badge-limited'
        : 'badge-open';

  return (
    <button
      className={`clinic-card card ${isSelected ? 'clinic-card--selected' : ''}`}
      onClick={onClick}
      id={`clinic-card-${clinic.id}`}
    >
      <div className="clinic-card__header">
        <h4 className="clinic-card__name">{clinic.name}</h4>
        <span className={`badge ${capacityClass}`}>{capacityLabel}</span>
      </div>

      <p className="clinic-card__address">{clinic.address}</p>

      <div className="clinic-card__meta">
        {clinic.openingHours && clinic.openingHours !== 'Hours Unavailable' && (
          <span className="clinic-card__hours">
            <Clock size={13} /> {clinic.openingHours}
          </span>
        )}
        {clinic.rating && (
          <span className="clinic-card__rating">⭐ {clinic.rating.toFixed(1)}</span>
        )}
      </div>

      <div className="clinic-card__actions">
        {clinic.phoneNum && clinic.phoneNum.trim().length > 0 && (
          <a
            href={`tel:${clinic.phoneNum}`}
            className="btn btn-primary btn-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone size={14} /> Call
          </a>
        )}
        <a
          href={getGoogleMapsUrl(clinic.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <Navigation size={14} /> Directions
        </a>
      </div>
    </button>
  );
};

export const ClinicDrawer = ({
  isOpen,
  onClose,
  clinics,
  selectedClinic,
  onClinicSelect,
}: ClinicDrawerProps) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="drawer-overlay" onClick={onClose} />}

      {/* Drawer */}
      <div className={`clinic-drawer ${isOpen ? 'clinic-drawer--open' : ''}`}>
        {/* Handle bar */}
        <div className="clinic-drawer__handle" onClick={onClose}>
          <div className="clinic-drawer__handle-bar" />
        </div>

        {/* Header */}
        <div className="clinic-drawer__header">
          <div>
            <h3>Emergency Vets Nearby</h3>
            <p className="clinic-drawer__subtitle">
              {clinics.length} clinic{clinics.length !== 1 ? 's' : ''} currently open
            </p>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </button>
        </div>

        {/* Clinic list */}
        <div className="clinic-drawer__list">
          {clinics.length === 0 ? (
            <div className="clinic-drawer__empty">
              <p>No open clinics found nearby.</p>
              <p className="clinic-drawer__empty-sub">Try expanding your search area.</p>
            </div>
          ) : (
            clinics.map((clinic, i) => (
              <div key={clinic.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <ClinicCard
                  clinic={clinic}
                  isSelected={selectedClinic?.id === clinic.id}
                  onClick={() => onClinicSelect(clinic)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Peek button when drawer is closed */}
      {!isOpen && clinics.length > 0 && (
        <button className="drawer-peek glass-card" onClick={() => onClinicSelect(clinics[0])}>
          <ChevronUp size={16} />
          <span>View {clinics.length} open clinics</span>
        </button>
      )}
    </>
  );
};
