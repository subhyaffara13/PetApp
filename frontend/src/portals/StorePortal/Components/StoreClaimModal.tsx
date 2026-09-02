import React, { useState } from 'react';
import axios from 'axios';
import { Store as StoreIcon } from 'lucide-react';
import { Modal, Button } from '../../../Components/UI';

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

  const modalTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <StoreIcon size={20} color="#f59e0b" />
      <span>Select & Claim Your Store Listing</span>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} title={modalTitle} maxWidth="640px">
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0 0 1rem' }}>
        Only verified, claimed pet store listings can accept digital and DaaS emergency delivery orders.
      </p>

      {claimError && (
        <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0 0 0.75rem' }}>{claimError}</p>
      )}

      <div className="claim-stores-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {stores.map((s) => {
          const isCurrent = s._id === currentStoreId;
          return (
            <div key={s._id} className={`claim-store-item ${isCurrent ? 'claim-store-item--active' : ''}`}>
              <div className="claim-store-details">
                <h4 style={{ margin: '0 0 0.2rem', fontSize: '1rem', color: '#f8fafc' }}>{s.name}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>{s.address?.street}, {s.address?.city}</p>
                <span className={`claim-status-tag ${s.isClaimed ? 'tag-claimed' : 'tag-unclaimed'}`} style={{ marginTop: '0.4rem', display: 'inline-block' }}>
                  {s.isClaimed ? '✓ Claimed & Accepting Orders' : '⚠️ Unclaimed Listing (Orders Paused)'}
                </span>
              </div>
              <div>
                {s.isClaimed ? (
                  <Button
                    variant={isCurrent ? 'glass' : 'primary'}
                    size="sm"
                    onClick={() => onSelectStore(s)}
                  >
                    {isCurrent ? '✓ Active Console' : 'Switch Store'}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={claimingId === s._id}
                    onClick={() => handleClaim(s)}
                  >
                    Claim & Open Store
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
