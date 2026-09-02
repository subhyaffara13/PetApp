import React from 'react';

export interface ServiceOption {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  icon: string;
}

const SERVICE_PRESETS: Record<string, ServiceOption[]> = {
  clinic: [
    { id: 'v-checkup', name: 'Comprehensive Routine Checkup', category: 'General', price: 180, duration: '30 min', icon: '🩺' },
    { id: 'v-vaccine', name: 'Annual Vaccination Booster', category: 'Preventative', price: 150, duration: '20 min', icon: '💉' },
    { id: 'v-dental', name: 'Dental Hygiene & Tartar Check', category: 'Dental', price: 220, duration: '45 min', icon: '🦷' },
    { id: 'v-telehealth', name: 'Video Telehealth Consultation', category: 'Virtual', price: 120, duration: '25 min', icon: '📱' },
  ],
  groomer: [
    { id: 'g-full', name: 'Full Groom & Coat Styling', category: 'Full Service', price: 220, duration: '60 min', icon: '✂️' },
    { id: 'g-bath', name: 'De-Shedding Bath & Blowdry', category: 'Hygiene', price: 140, duration: '45 min', icon: '🛁' },
    { id: 'g-nails', name: 'Nail Trim & Ear Cleaning', category: 'Express', price: 70, duration: '15 min', icon: '🐾' },
  ],
  dog_walker: [
    { id: 'w-30', name: '30-Minute Neighborhood Solo Walk', category: 'Walk', price: 60, duration: '30 min', icon: '🐕' },
    { id: 'w-60', name: '60-Minute Park Adventure & Play', category: 'Adventure', price: 95, duration: '60 min', icon: '🌳' },
  ],
  pet_sitter: [
    { id: 's-dropin', name: 'Home Drop-in & Feeding Visit', category: 'Drop-In', price: 80, duration: '45 min', icon: '🏡' },
    { id: 's-overnight', name: 'Overnight House Sitting & Care', category: 'Overnight', price: 250, duration: '24 hrs', icon: '🌙' },
  ],
};

interface BookingServiceSelectorProps {
  providerType: string;
  selectedService: ServiceOption | null;
  onSelectService: (service: ServiceOption) => void;
}

export const BookingServiceSelector: React.FC<BookingServiceSelectorProps> = ({
  providerType,
  selectedService,
  onSelectService,
}) => {
  const options = SERVICE_PRESETS[providerType] || SERVICE_PRESETS.clinic;

  return (
    <div className="booking-services-group">
      <label className="booking-field-label">Select Service / Visit Type</label>
      <div className="services-choice-grid">
        {options.map((srv) => (
          <button
            key={srv.id}
            type="button"
            className={`service-card-btn ${selectedService?.id === srv.id ? 'active' : ''}`}
            onClick={() => onSelectService(srv)}
          >
            <span className="srv-icon">{srv.icon}</span>
            <div className="srv-info">
              <strong className="srv-name">{srv.name}</strong>
              <span className="srv-meta">{srv.duration} · {srv.category}</span>
            </div>
            <span className="srv-price">₪{srv.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
