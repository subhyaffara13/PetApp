import React, { useState } from 'react';
import axios from 'axios';

interface Store {
  _id: string;
  name: string;
  address: { street: string; city: string };
  isClaimed?: boolean;
  contactPhone?: string;
}

interface StoreClaimModalProps {
  stores: Store[];
  currentStoreId: string;
  onSelectStore: (store: Store) => void;
  onClose: () => void;
  apiUrl: string;
}

export const StoreClaimModal: React.FC<StoreClaimModalProps> = ({
  stores,
  currentStoreId,
  onSelectStore,
  onClose,
  apiUrl,
}) => {
  const [emailInput] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState('');

  const handleClaim = async (store: Store) => {
    setClaimingId(store._id);
    setClaimError('');
    try {
      await axios.post(`${apiUrl}/stores/claim`, {
        storeId: store._id,
        ownerEmail: emailInput || 'store.owner@petsos.co.il',
      });
      onSelectStore({ ...store, isClaimed: true });
    } catch {
      setClaimError(`Failed to claim "${store.name}". Please try again.`);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="claim-modal-overlay" onClick={onClose}>
      <div className="claim-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="claim-modal-header">
          <h3>🏪 Select & Claim Your Store Listing</h3>
          <button type="button" className="btn-close-modal" onClick={onClose}>✕</button>
        </div>
        <p className="claim-modal-subtitle">
          Only verified, claimed pet store listings can accept digital and DaaS emergency delivery orders.
        </p>

        {claimError && (
          <p className="claim-modal-error" style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0 0 0.75rem' }}>{claimError}</p>
        )}

        <div className="claim-stores-list">
          {stores.map((s) => {
            const isCurrent = s._id === currentStoreId;
            return (
              <div key={s._id} className={`claim-store-item ${isCurrent ? 'claim-store-item--active' : ''}`}>
                <div className="claim-store-details">
                  <h4>{s.name}</h4>
                  <p>{s.address?.street}, {s.address?.city}</p>
                  <span className={`claim-status-tag ${s.isClaimed ? 'tag-claimed' : 'tag-unclaimed'}`}>
                    {s.isClaimed ? '✓ Claimed & Accepting Orders' : '⚠️ Unclaimed Listing (Orders Paused)'}
                  </span>
                </div>
                <div>
                  {s.isClaimed ? (
                    <button
                      type="button"
                      className={`btn-claim-action ${isCurrent ? 'btn-claim-action--active' : ''}`}
                      onClick={() => onSelectStore(s)}
                    >
                      {isCurrent ? '✓ Active Console' : 'Switch Store'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-claim-action btn-claim-now"
                      disabled={claimingId === s._id}
                      onClick={() => handleClaim(s)}
                    >
                      {claimingId === s._id ? 'Verifying...' : 'Claim & Open Store'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
