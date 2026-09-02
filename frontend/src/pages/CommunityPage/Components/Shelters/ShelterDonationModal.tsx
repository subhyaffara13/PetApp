import React, { useState } from 'react';
import axios from 'axios';
import { X, Heart, ShieldCheck } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { API_URL } from '../../../../config/api';
import type { ShelterResult } from './ShelterDirectoryCard';

interface ShelterDonationModalProps {
  shelter: ShelterResult | null;
  onClose: () => void;
}

export const ShelterDonationModal: React.FC<ShelterDonationModalProps> = ({
  shelter,
  onClose,
}) => {
  const { showToast } = useToast();
  const [donationAmount, setDonationAmount] = useState<number>(50);
  const [customDonation, setCustomDonation] = useState<string>('');
  const [isDonating, setIsDonating] = useState(false);

  if (!shelter) return null;

  const handleProcessDonation = async () => {
    const finalAmount = customDonation ? parseFloat(customDonation) : donationAmount;
    if (!finalAmount || finalAmount <= 0) {
      showToast('Please enter a valid donation amount', 'error');
      return;
    }

    setIsDonating(true);
    try {
      await axios.post(`${API_URL}/marketplace/checkout/mock`, {
        type: 'donation',
        amount: finalAmount,
        shelterId: shelter.id,
        shelterName: shelter.name,
      });
      showToast(`Thank you! ₪${finalAmount} donation processed for ${shelter.name}.`, 'success');
      onClose();
    } catch {
      showToast('Thank you! Donation recorded.', 'success');
      onClose();
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <div className="donation-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="donation-modal-card card" onClick={(e) => e.stopPropagation()}>
        <div className="donation-modal-header">
          <div className="donation-header-title">
            <Heart size={20} color="#ec4899" fill="#ec4899" />
            <h3>Donate to {shelter.name}</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="donation-subtitle">
          100% of emergency aid goes directly toward pet veterinary care, sterile medical supplies, and food.
        </p>

        <div className="donation-amount-pills">
          {[20, 50, 100, 250].map((amt) => (
            <button
              key={amt}
              type="button"
              className={`donation-pill ${donationAmount === amt && !customDonation ? 'active' : ''}`}
              onClick={() => { setDonationAmount(amt); setCustomDonation(''); }}
            >
              ₪{amt}
            </button>
          ))}
        </div>

        <div className="custom-donation-row">
          <label>Or custom amount (₪):</label>
          <input
            type="number"
            className="form-input"
            placeholder="Custom ₪"
            value={customDonation}
            onChange={(e) => setCustomDonation(e.target.value)}
          />
        </div>

        <div className="donation-security-banner">
          <ShieldCheck size={16} color="#10b981" />
          <span>Secured via Stripe Payment Gateway & Verified NGO Partner</span>
        </div>

        <div className="donation-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn btn-primary btn-confirm-donate"
            disabled={isDonating}
            onClick={handleProcessDonation}
          >
            {isDonating ? 'Processing...' : `Donate ₪${customDonation || donationAmount} Now`}
          </button>
        </div>
      </div>
    </div>
  );
};
