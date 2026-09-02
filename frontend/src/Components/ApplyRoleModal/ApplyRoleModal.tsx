import React, { useState } from 'react';
import axios from 'axios';
import { X, ShieldCheck, CheckCircle2, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config/api';
import { RoleSelectionGrid, type ProfessionalType } from './Components/RoleSelectionGrid';
import { RoleFormFields } from './Components/RoleFormFields';
import './ApplyRoleModal.css';

interface ApplyRoleModalProps {
  onClose: () => void;
}

export const ApplyRoleModal: React.FC<ApplyRoleModalProps> = ({ onClose }) => {
  const { user, accessToken, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [selectedType, setSelectedType] = useState<ProfessionalType>('walker');
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
      const entityName =
        selectedType === 'walker'
          ? `${contactName} (Verified Dog Walker)`
          : selectedType === 'groomer'
            ? `${orgName || contactName} (Certified Groomer)`
            : selectedType === 'sitter'
              ? `${contactName} (Pet Sitter)`
              : orgName;

      const refDetails =
        selectedType === 'walker'
          ? `Rate: ₪${hourlyRate}/walk · Services: ${servicesOffered} · ID & Police Check: ${licenseOrRef || 'Verified'}`
          : selectedType === 'groomer'
            ? `Salon / Mobile Studio: ${orgName} · License: ${licenseOrRef || 'Certified'}`
            : selectedType === 'sitter'
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
          <button className="apply-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {isSuccess ? (
          <div className="apply-success-view">
            <CheckCircle2 size={48} color="#10b981" />
            <h4>Application Submitted Successfully!</h4>
            <p>Our veterinary & safety compliance team reviews all submissions within 24-48 hours.</p>
            <button className="btn btn-primary" onClick={onClose}>Got It</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="apply-role-form">
            <RoleSelectionGrid selectedType={selectedType} onSelect={setSelectedType} />
            <RoleFormFields
              selectedType={selectedType}
              practiceType={practiceType}
              setPracticeType={setPracticeType}
              orgName={orgName}
              setOrgName={setOrgName}
              address={address}
              setAddress={setAddress}
              contactName={contactName}
              setContactName={setContactName}
              contactPhone={contactPhone}
              setContactPhone={setContactPhone}
              hourlyRate={hourlyRate}
              setHourlyRate={setHourlyRate}
              servicesOffered={servicesOffered}
              setServicesOffered={setServicesOffered}
              licenseOrRef={licenseOrRef}
              setLicenseOrRef={setLicenseOrRef}
            />
            <div className="apply-role-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : <><Send size={15} /> Submit for Review</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
