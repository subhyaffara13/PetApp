import React from 'react';
import type { GroomingServiceItem } from '../../../schemas';
import { Plus, Clock } from 'lucide-react';

interface GroomerServicesTabProps {
  services: GroomingServiceItem[];
  onAddClick: () => void;
}

export const GroomerServicesTab: React.FC<GroomerServicesTabProps> = ({
  services,
  onAddClick,
}) => {
  return (
    <div className="groomer-services-tab">
      <div className="services-tab-header">
        <div>
          <h2>Salon Services & Pricing Catalog</h2>
          <p>Customize standard treatments, add-ons, durations, and pricing.</p>
        </div>
        <button
          type="button"
          className="btn-add-service"
          onClick={onAddClick}
        >
          <Plus size={16} /> Add Grooming Service
        </button>
      </div>

      <div className="services-grid">
        {services.map((srv) => (
          <div key={srv._id || srv.name} className="service-card-item">
            <div className="service-card-top">
              <div>
                <span className="service-cat-badge">
                  {srv.category ? srv.category.replace('_', ' ').toUpperCase() : 'SPA TREATMENT'}
                </span>
                <h3 className="service-name">{srv.name}</h3>
              </div>
              <span className="service-price">₪{srv.price}</span>
            </div>

            <p className="service-desc">{srv.description || 'Full grooming care package.'}</p>

            <div className="service-meta-footer">
              <div className="service-duration">
                <Clock size={14} /> {srv.durationMinutes || 45} mins
              </div>
              <span className="service-active-pill">Active on Booking</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
