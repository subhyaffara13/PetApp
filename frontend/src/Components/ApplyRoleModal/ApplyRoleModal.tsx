import React, { useState } from 'react';
import axios from 'axios';
import { X, ShieldCheck, CheckCircle2, Stethoscope, Store, Home, Dog, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config/api';
import './ApplyRoleModal.css';

interface ApplyRoleModalProps {
  onClose: () => void;
}

type ProfessionalType = 'sitter' | 'shelter' | 'clinic' | 'store';

export const ApplyRoleModal: React.FC<ApplyRoleModalProps> = ({ onClose }) => {
  const { user, accessToken, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [selectedType, setSelectedType] = useState<ProfessionalType>('sitter');
  const [practiceType, setPracticeType] = useState<'stationary_clinic' | 'mobile_vet'>('stationary_clinic');
  const [orgName, setOrgName] = useState('');
  const [address, setAddress] = useState('Haifa, Israel');
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState('+972-5');
  const [licenseOrRef, setLicenseOrRef] = useState('');
  const [servicesOffered, setServicesOffered] = useState('Dog Walking, Drop-in Visits');
  const [hourlyRate, setHourlyRate] = useState('65');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to submit a professional verification claim', 'info', '🔒 Sign In Required');
      openAuthModal();
      return;
    }

    setIsSubmitting(true);
    try {
      const entityName = selectedType === 'sitter' ? `${contactName} (Pet Sitter)` : orgName;
      const refDetails = selectedType === 'sitter'
        ? `Rate: ₪${hourlyRate}/hr · Services: ${servicesOffered} · Cert: ${licenseOrRef || 'ID Verified'}`
        : licenseOrRef;

      await axios.post(
        `${API_URL}/auth/apply-verification`,
        {
          entityType: selectedType,
          practiceType: selectedType === 'clinic' ? practiceType : 'none',
          entityName,
          entityAddress: selectedType === 'clinic' && practiceType === 'mobile_vet' ? `${address} (Mobile Ambulatory Coverage Area)` : address,
          contactName,
          contactPhone,
          businessLicense: refDetails || 'Submitted Application',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setIsSuccess(true);
      showToast('Verification application received! Our admin team will review shortly.', 'success', '🛡️ Submitted');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to submit application.', 'error', '❌ Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="apply-role-modal-overlay" onClick={onClose}>
      <div className="apply-role-modal card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="apply-role-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} color="var(--color-primary, #38bdf8)" />
            <div>
              <h3>Apply for Verified Professional Role</h3>
              <p>Get certified on PetSOS with an official verification badge & portal access</p>
            </div>
          </div>
          <button className="apply-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="apply-success-view">
            <CheckCircle2 size={52} color="#10b981" />
            <h4>Application Submitted!</h4>
            <p>
              Your verification request for <strong>{selectedType.toUpperCase()}</strong> has been routed to PetSOS superadmins.
              Once approved, your profile will display the official Verified Badge.
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '1rem' }}>
              Back to PetSOS
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="apply-role-form">
            <label className="apply-label">Select Your Professional Role</label>
            <div className="role-selector-grid">
              <button
                type="button"
                className={`role-option-btn ${selectedType === 'sitter' ? 'selected' : ''}`}
                onClick={() => setSelectedType('sitter')}
              >
                <Dog size={20} color="#a855f7" />
                <strong>Pet Sitter & Walker</strong>
                <span>Offer walks, sitting & boarding</span>
              </button>

              <button
                type="button"
                className={`role-option-btn ${selectedType === 'shelter' ? 'selected' : ''}`}
                onClick={() => setSelectedType('shelter')}
              >
                <Home size={20} color="#10b981" />
                <strong>Animal Shelter / Rescue</strong>
                <span>List adoptions & receive donations</span>
              </button>

              <button
                type="button"
                className={`role-option-btn ${selectedType === 'clinic' ? 'selected' : ''}`}
                onClick={() => setSelectedType('clinic')}
              >
                <Stethoscope size={20} color="#38bdf8" />
                <strong>Veterinary Clinic</strong>
                <span>ER triage & clinic portal access</span>
              </button>

              <button
                type="button"
                className={`role-option-btn ${selectedType === 'store' ? 'selected' : ''}`}
                onClick={() => setSelectedType('store')}
              >
                <Store size={20} color="#f59e0b" />
                <strong>Pet Supply Merchant</strong>
                <span>Sell goods & manage DaaS delivery</span>
              </button>
            </div>

            {selectedType === 'clinic' && (
              <div className="apply-field">
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--color-text-muted)' }}>
                  Veterinary Practice Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPracticeType('stationary_clinic')}
                    style={{
                      padding: '0.6rem 0.5rem',
                      borderRadius: 8,
                      border: practiceType === 'stationary_clinic' ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      background: practiceType === 'stationary_clinic' ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                      color: practiceType === 'stationary_clinic' ? '#38bdf8' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.15rem',
                    }}
                  >
                    <span>🏥 Physical Clinic</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 400 }}>Fixed Address / Hospital</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPracticeType('mobile_vet')}
                    style={{
                      padding: '0.6rem 0.5rem',
                      borderRadius: 8,
                      border: practiceType === 'mobile_vet' ? '1.5px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                      background: practiceType === 'mobile_vet' ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.03)',
                      color: practiceType === 'mobile_vet' ? '#f472b6' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.15rem',
                    }}
                  >
                    <span>🚐 On-The-Move Vet</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 400 }}>Live GPS / House Visits</span>
                  </button>
                </div>
              </div>
            )}

            {selectedType !== 'sitter' && (
              <div className="apply-field">
                <label>
                  {selectedType === 'clinic' && practiceType === 'mobile_vet'
                    ? 'Mobile Service / Doctor Name'
                    : 'Organization / Business Name'}
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder={
                    selectedType === 'shelter'
                      ? 'e.g. SOS Pets Rescue Haifa'
                      : selectedType === 'clinic' && practiceType === 'mobile_vet'
                      ? 'e.g. Dr. Sarah Cohen — Mobile Vet Ambulatory'
                      : 'e.g. Carmel Pet Care'
                  }
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="apply-field-row">
              <div className="apply-field" style={{ flex: 1 }}>
                <label>Contact Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                />
              </div>

              <div className="apply-field" style={{ flex: 1 }}>
                <label>Phone / WhatsApp</label>
                <input
                  type="text"
                  className="input"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="apply-field">
              <label>Service City / Primary Address</label>
              <input
                type="text"
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            {selectedType === 'sitter' && (
              <div className="apply-field-row">
                <div className="apply-field" style={{ flex: 1 }}>
                  <label>Hourly Rate (₪)</label>
                  <input
                    type="number"
                    className="input"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    required
                  />
                </div>
                <div className="apply-field" style={{ flex: 2 }}>
                  <label>Services Offered</label>
                  <input
                    type="text"
                    className="input"
                    value={servicesOffered}
                    onChange={(e) => setServicesOffered(e.target.value)}
                    placeholder="e.g. Dog Walking, Overnight Boarding"
                    required
                  />
                </div>
              </div>
            )}

            <div className="apply-field">
              <label>
                {selectedType === 'shelter'
                  ? 'Non-Profit / NGO Registration Number'
                  : selectedType === 'clinic'
                  ? 'Veterinary Medical License #'
                  : selectedType === 'store'
                  ? 'Business License #'
                  : 'Certifications / ID Reference (Optional)'}
              </label>
              <input
                type="text"
                className="input"
                placeholder={selectedType === 'sitter' ? 'e.g. Pet First Aid Certified, 5y Experience' : 'e.g. NGO-580123456'}
                value={licenseOrRef}
                onChange={(e) => setLicenseOrRef(e.target.value)}
              />
            </div>

            <div className="apply-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <Send size={15} /> {isSubmitting ? 'Transmitting Claim...' : 'Submit Verification Claim'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
