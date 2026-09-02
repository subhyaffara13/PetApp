import React from 'react';
import type { ProfessionalType } from './RoleSelectionGrid';

interface RoleFormFieldsProps {
  selectedType: ProfessionalType;
  practiceType: 'stationary_clinic' | 'mobile_vet';
  setPracticeType: (v: 'stationary_clinic' | 'mobile_vet') => void;
  orgName: string;
  setOrgName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  contactName: string;
  setContactName: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  hourlyRate: string;
  setHourlyRate: (v: string) => void;
  servicesOffered: string;
  setServicesOffered: (v: string) => void;
  licenseOrRef: string;
  setLicenseOrRef: (v: string) => void;
}

export const RoleFormFields: React.FC<RoleFormFieldsProps> = ({
  selectedType,
  practiceType,
  setPracticeType,
  orgName,
  setOrgName,
  address,
  setAddress,
  contactName,
  setContactName,
  contactPhone,
  setContactPhone,
  hourlyRate,
  setHourlyRate,
  servicesOffered,
  setServicesOffered,
  licenseOrRef,
  setLicenseOrRef,
}) => {
  return (
    <div className="apply-form-fields">
      {selectedType === 'clinic' && (
        <div className="form-group">
          <label>Practice Delivery Type</label>
          <div className="practice-type-toggle">
            <button
              type="button"
              className={`practice-btn ${practiceType === 'stationary_clinic' ? 'active' : ''}`}
              onClick={() => setPracticeType('stationary_clinic')}
            >
              🏥 Brick & Mortar Clinic
            </button>
            <button
              type="button"
              className={`practice-btn ${practiceType === 'mobile_vet' ? 'active' : ''}`}
              onClick={() => setPracticeType('mobile_vet')}
            >
              🚐 Mobile Ambulatory Vet
            </button>
          </div>
        </div>
      )}

      {(selectedType === 'shelter' || selectedType === 'clinic' || selectedType === 'store' || selectedType === 'groomer') && (
        <div className="form-group">
          <label>Business / Salon / Shelter Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Carmel Pet Oasis"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        </div>
      )}

      <div className="form-row-2">
        <div className="form-group">
          <label>Contact Full Name *</label>
          <input
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Direct Phone / Mobile *</label>
          <input
            type="tel"
            required
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>
          {selectedType === 'walker' || selectedType === 'sitter' ? 'Service City / Coverage Area *' : 'Location Address *'}
        </label>
        <input
          type="text"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {(selectedType === 'walker' || selectedType === 'sitter') && (
        <div className="form-row-2">
          <div className="form-group">
            <label>Rate (₪ / walk or hr)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Services Offered</label>
            <input
              type="text"
              value={servicesOffered}
              onChange={(e) => setServicesOffered(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <label>
          {selectedType === 'walker' || selectedType === 'sitter'
            ? 'Background Check ID / Police Clearance Reference'
            : 'Business Registration / Vet License Number'}
        </label>
        <input
          type="text"
          placeholder="e.g. LIC-2026-9941"
          value={licenseOrRef}
          onChange={(e) => setLicenseOrRef(e.target.value)}
        />
      </div>
    </div>
  );
};
