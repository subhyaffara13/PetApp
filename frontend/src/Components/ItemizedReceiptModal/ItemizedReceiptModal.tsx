import React, { useRef } from 'react';
import type { Receipt } from '../../schemas';
import { useTranslation } from '../../context/LanguageContext';
import { Printer, X, CheckCircle, Receipt as ReceiptIcon, ShieldCheck } from 'lucide-react';
import './ItemizedReceiptModal.css';

interface ItemizedReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt | null;
}

export const ItemizedReceiptModal: React.FC<ItemizedReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !receipt) return null;

  const curr = receipt.currency === 'USD' ? '$' : receipt.currency === 'EUR' ? '€' : '₪';
  const formattedDate = receipt.paidAt
    ? new Date(receipt.paidAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div className="receipt-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-modal-header no-print">
          <div className="receipt-header-title">
            <ReceiptIcon size={20} color="#38bdf8" />
            <span>{t('receipt.official_invoice', 'Official Itemized Receipt')}</span>
          </div>
          <div className="receipt-header-actions">
            <button type="button" className="receipt-action-btn" onClick={handlePrint}>
              <Printer size={16} />
              <span>{t('receipt.print', 'Print / PDF')}</span>
            </button>
            <button type="button" className="receipt-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="receipt-paper" ref={printRef}>
          {/* Top Invoice Banner */}
          <div className="receipt-brand-header">
            <div>
              <h2 className="receipt-brand-logo">🐾 PetSOS</h2>
              <p className="receipt-brand-tagline">
                Emergency Veterinary, Grooming & Pet Marketplace
              </p>
            </div>
            <div className="receipt-paid-stamp">
              <CheckCircle size={16} color="#10b981" />
              <span>PAID & STORED</span>
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="receipt-meta-grid">
            <div className="meta-col">
              <span className="meta-label">Receipt Number</span>
              <span className="meta-value-highlight">#{receipt.receiptNumber}</span>

              <span className="meta-label mt-8">Billed To</span>
              <span className="meta-value">{receipt.customerName}</span>
              <span className="meta-sub">{receipt.customerEmail}</span>
            </div>

            <div className="meta-col text-right">
              <span className="meta-label">Service Provider / Merchant</span>
              <span className="meta-value provider">{receipt.providerName}</span>
              {receipt.providerAddress && (
                <span className="meta-sub">{receipt.providerAddress}</span>
              )}

              <span className="meta-label mt-8">Date & Time</span>
              <span className="meta-value">{formattedDate}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="receipt-items-container">
            <table className="receipt-table">
              <thead>
                <tr>
                  <th className="th-desc">Description</th>
                  <th className="th-qty">Qty</th>
                  <th className="th-price">Unit Price</th>
                  <th className="th-total">Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="td-desc">
                      <strong>{item.name}</strong>
                      {item.description && <p className="item-note">{item.description}</p>}
                    </td>
                    <td className="td-qty">{item.quantity}</td>
                    <td className="td-price">{curr}{item.unitPrice.toFixed(2)}</td>
                    <td className="td-total">{curr}{item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="receipt-totals-section">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>{curr}{receipt.subtotal.toFixed(2)}</span>
            </div>

            {receipt.deliveryFee ? (
              <div className="totals-row">
                <span>Wolt Express Courier Delivery</span>
                <span>{curr}{receipt.deliveryFee.toFixed(2)}</span>
              </div>
            ) : null}

            <div className="totals-row">
              <span>VAT / Tax ({Math.round((receipt.taxRate || 0.17) * 100)}%)</span>
              <span>{curr}{receipt.taxAmount.toFixed(2)}</span>
            </div>

            {receipt.discountAmount ? (
              <div className="totals-row discount">
                <span>Promotional Discount</span>
                <span>-{curr}{receipt.discountAmount.toFixed(2)}</span>
              </div>
            ) : null}

            <div className="totals-row grand-total">
              <span>Total Amount Paid</span>
              <span className="grand-price">{curr}{receipt.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment & Security Verification */}
          <div className="receipt-footer-badge">
            <ShieldCheck size={16} color="#0284c7" />
            <div>
              <p className="footer-title">Verified Electronic Tax Receipt</p>
              <p className="footer-desc">
                Payment processed via Stripe Secure Gateway. Stored in your PetSOS database profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
