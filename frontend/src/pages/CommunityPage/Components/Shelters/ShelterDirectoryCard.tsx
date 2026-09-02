import React from 'react';
import { MapPin, Phone, Globe, Heart } from 'lucide-react';

export interface ShelterResult {
  id: string;
  name: string;
  address: string;
  country: string;
  countryCode: string;
  location: { lat: number; lng: number };
  phone: string | null;
  website: string | null;
  rating?: number;
  distanceKm?: number;
}

interface ShelterDirectoryCardProps {
  shelter: ShelterResult;
  onOpenDonation: (shelter: ShelterResult) => void;
}

export const ShelterDirectoryCard: React.FC<ShelterDirectoryCardProps> = ({
  shelter,
  onOpenDonation,
}) => {
  return (
    <div className="shelter-org-card card">
      <div className="shelter-org-body">
        <div className="shelter-header-line">
          <h4>{shelter.name}</h4>
          {shelter.distanceKm && (
            <span className="shelter-dist-pill">{shelter.distanceKm.toFixed(1)} km</span>
          )}
        </div>

        <p className="shelter-address">
          <MapPin size={13} /> {shelter.address}
        </p>

        <div className="shelter-contact-row">
          {shelter.phone && (
            <a href={`tel:${shelter.phone}`} className="shelter-contact-link">
              <Phone size={13} /> {shelter.phone}
            </a>
          )}
          {shelter.website && (
            <a
              href={shelter.website}
              target="_blank"
              rel="noopener noreferrer"
              className="shelter-contact-link"
            >
              <Globe size={13} /> Website
            </a>
          )}
        </div>
      </div>

      <div className="shelter-org-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm btn-donate-shelter"
          onClick={() => onOpenDonation(shelter)}
        >
          <Heart size={14} color="#ec4899" fill="#ec4899" /> Donate Direct
        </button>
      </div>
    </div>
  );
};
