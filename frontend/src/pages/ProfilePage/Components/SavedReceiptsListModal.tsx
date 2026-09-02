import React from 'react';
import { X, Receipt as ReceiptIcon } from 'lucide-react';
import type { Receipt } from '../../../schemas';

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
  if (!isOpen) return null;

  return (
    <div className="receipts-list-modal-backdrop" onClick={onClose}>
      <div className="receipts-list-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="receipts-list-header">
          <div className="header-title-row">
            <ReceiptIcon size={20} color="#34d399" />
            <h3>My Saved Receipts & Tax Invoices</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="receipts-list-scroll">
          {receipts.map((r) => (
            <div
              key={r._id || r.receiptNumber}
              className="receipt-row-item"
              onClick={() => onSelectReceipt(r)}
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
      </div>
    </div>
  );
};
