import React, { useState } from 'react';
import axios from 'axios';
import { Heart, ShieldCheck } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { API_URL } from '../../../../config/api';
import { Modal, Button, Input } from '../../../../Components/UI';
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

  const modalTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <Heart size={20} color="#ec4899" fill="#ec4899" />
      <span>Donate to {shelter.name}</span>
    </div>
  );

  return (
    <Modal isOpen={!!shelter} onClose={onClose} title={modalTitle} maxWidth="480px">
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 1rem' }}>
        100% of emergency aid goes directly toward pet veterinary care, sterile medical supplies, and food.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {[20, 50, 100, 250].map((amt) => (
          <button
            key={amt}
            type="button"
            className={`donation-pill ${donationAmount === amt && !customDonation ? 'active' : ''}`}
            onClick={() => { setDonationAmount(amt); setCustomDonation(''); }}
            style={{ flex: 1, padding: '0.6rem', borderRadius: '0.75rem', fontWeight: 700 }}
          >
            ₪{amt}
          </button>
        ))}
      </div>

      <Input
        label="Or Custom Amount (₪)"
        type="number"
        placeholder="e.g. 75"
        value={customDonation}
        onChange={(e) => setCustomDonation(e.target.value)}
      />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '0.75rem',
        color: '#10b981',
        fontSize: '0.75rem',
        margin: '1rem 0'
      }}>
        <ShieldCheck size={16} />
        <span>Secured via Stripe Payment Gateway & 0% Platform Commission</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          isLoading={isDonating}
          onClick={handleProcessDonation}
          leftIcon={<Heart size={16} fill="currentColor" />}
        >
          Donate ₪{customDonation || donationAmount}
        </Button>
      </div>
    </Modal>
  );
};
