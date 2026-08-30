import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import './DigitalReceiptModal.css';

export interface ReceiptData {
  orderId: string;
  date: string;
  storeName: string;
  storeAddress?: string;
  customerName?: string;
  deliveryAddress?: { street: string; city: string; apt?: string };
  deliveryMode: 'delivery' | 'pickup';
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  total: number;
  paymentMethod: string;
}

interface DigitalReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const isPickup = receipt.deliveryMode === 'pickup';

  return (
    <div className="receipt-modal-overlay" onClick={onClose}>
      <div className="receipt-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-modal-header">
          <div className="receipt-header-title">
            <ShieldCheck size={18} color="#10b981" />
            <h3>Official Digital Tax Receipt (קבלה דיגיטלית)</h3>
          </div>
          <button type="button" className="btn-close-receipt" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="receipt-modal-body" id="printable-receipt">
          <div className="receipt-business-head">
            <h2>{receipt.storeName}</h2>
            <p>{receipt.storeAddress || 'Haifa, Israel'} · Licensed Pet Retailer</p>
            <span className="receipt-invoice-no">Invoice #: INV-{receipt.orderId.slice(-6).toUpperCase()}</span>
          </div>

          <div className="receipt-meta-grid">
            <div><small>Date:</small> <span>{new Date(receipt.date).toLocaleString()}</span></div>
            <div><small>Payment:</small> <span>{receipt.paymentMethod.toUpperCase()} (Authorized)</span></div>
            <div><small>Fulfillment:</small> <span>{isPickup ? '🛍️ Self Pickup (איסוף עצמי)' : '🛵 DaaS Express Delivery'}</span></div>
            <div><small>Status:</small> <strong style={{ color: '#10b981' }}>PAID & VERIFIED</strong></div>
          </div>

          {!isPickup && receipt.deliveryAddress && (
            <div className="receipt-address-banner">
              📍 <strong>Delivery To:</strong> {receipt.deliveryAddress.street}, {receipt.deliveryAddress.city} {receipt.deliveryAddress.apt ? `(${receipt.deliveryAddress.apt})` : ''}
            </div>
          )}

          <div className="receipt-items-table">
            <div className="receipt-table-head">
              <span>Item & Description</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            {receipt.items.map((it, idx) => (
              <div key={idx} className="receipt-table-row">
                <span className="item-name-cell">{it.productName}</span>
                <span>{it.quantity}x</span>
                <span>₪{it.unitPrice.toFixed(2)}</span>
                <strong>₪{(it.quantity * it.unitPrice).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <div className="receipt-calculation-summary">
            <div className="calc-row"><span>Merchandise Subtotal:</span><span>₪{receipt.subtotal.toFixed(2)}</span></div>
            <div className="calc-row"><span>Service Fee (2.5%):</span><span>₪{receipt.serviceFee.toFixed(2)}</span></div>
            <div className="calc-row"><span>{isPickup ? 'Store Pickup Fee:' : 'DaaS Courier Delivery:'}</span><span>{isPickup ? '₪0.00 (FREE)' : `₪${receipt.deliveryFee.toFixed(2)}`}</span></div>
            <div className="calc-row calc-total-row"><span>TOTAL CHARGED (כולל מע״מ):</span><strong>₪{receipt.total.toFixed(2)}</strong></div>
          </div>
        </div>

        <div className="receipt-modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
          <button type="button" className="btn-print-receipt" onClick={() => window.print()}>
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};
