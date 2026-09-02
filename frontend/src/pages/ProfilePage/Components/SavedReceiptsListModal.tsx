import React from 'react';
import { Receipt as ReceiptIcon } from 'lucide-react';
import type { Receipt } from '../../../schemas';
import { Modal } from '../../../Components/UI';

interface SavedReceiptsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipts: Receipt[];
  onSelectReceipt: (r: Receipt) => void;
}

export const SavedReceiptsListModal: React.FC<SavedReceiptsListModalProps> = ({
  isOpen,
  onClose,
  receipts,
  onSelectReceipt,
}) => {
  const modalTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <ReceiptIcon size={20} color="#34d399" />
      <span>My Saved Receipts & Tax Invoices</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="600px">
      <div className="receipts-list-scroll">
        {receipts.map((r) => (
          <div
            key={r._id || r.receiptNumber}
            className="receipt-row-item"
            onClick={() => onSelectReceipt(r)}
            style={{ cursor: 'pointer' }}
          >
            <div className="receipt-row-info">
              <span className="receipt-row-number">{r.receiptNumber}</span>
              <span className="receipt-row-provider">{r.providerName}</span>
              <span className="receipt-row-date">
                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>
            <div className="receipt-row-total">
              <strong>₪{r.total.toFixed(2)}</strong>
              <span className="receipt-view-btn">View & Print →</span>
            </div>
          </div>
        ))}

        {receipts.length === 0 && (
          <div className="receipts-empty-state">
            No saved receipts found on your profile yet.
          </div>
        )}
      </div>
    </Modal>
  );
};
