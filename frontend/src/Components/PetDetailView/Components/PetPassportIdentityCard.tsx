import React from 'react';
import { QrCode, Copy, Check, ShieldCheck } from 'lucide-react';
import type { PetProfile } from '../../../schemas';

interface PetPassportIdentityCardProps {
  pet: PetProfile;
  passportTag: string;
  copiedTag: boolean;
  onCopyTag: () => void;
}

export const PetPassportIdentityCard: React.FC<PetPassportIdentityCardProps> = ({
  pet,
  passportTag,
  copiedTag,
  onCopyTag,
}) => {
  return (
    <div className="pet-passport-identity-card card">
      <div className="passport-id-row">
        <div className="passport-icon-box">
          <QrCode size={24} color="#38bdf8" />
        </div>
        <div className="passport-info">
          <span className="passport-label">Official Pet Passport Tag Number</span>
          <div className="passport-number-wrapper">
            <span className="passport-tag-val">{passportTag}</span>
            <button
              className="btn-copy-tag"
              onClick={onCopyTag}
              title="Copy Unique Pet Tag"
            >
              {copiedTag ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copiedTag ? 'Copied' : 'Copy Tag'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="passport-security-meta">
        <span className="security-item">
          <ShieldCheck size={13} color="#10b981" /> Global PetSOS Registry Verified
        </span>
        {pet.microchipNumber && (
          <span className="security-item">
            💉 Microchip: <strong>{pet.microchipNumber}</strong>
          </span>
        )}
      </div>
    </div>
  );
};
