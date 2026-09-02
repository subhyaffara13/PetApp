import React from 'react';
import { CreditCard, Lock } from 'lucide-react';

interface CartOrderSummaryProps {
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  isProcessing: boolean;
  onOpenCheckoutModal: () => void;
}

export const CartOrderSummary: React.FC<CartOrderSummaryProps> = ({
  subtotal,
  serviceFee,
  deliveryFee,
  total,
  isProcessing,
  onOpenCheckoutModal,
}) => {
  return (
    <div className="cart-drawer__footer">
      <div className="cart-summary-line">
        <span>Subtotal</span>
        <span>₪{subtotal.toFixed(2)}</span>
      </div>
      <div className="cart-summary-line">
        <span>Platform & Safety Fee (2.5%)</span>
        <span>₪{serviceFee.toFixed(2)}</span>
      </div>
      {deliveryFee > 0 && (
        <div className="cart-summary-line">
          <span>Delivery Fee</span>
          <span>₪{deliveryFee.toFixed(2)}</span>
        </div>
      )}
      <div className="cart-summary-line cart-summary-line--total">
        <span>Total</span>
        <span>₪{total.toFixed(2)}</span>
      </div>

      <button
        className="btn btn-primary cart-checkout-btn"
        onClick={onOpenCheckoutModal}
        disabled={isProcessing}
      >
        {isProcessing ? (
          'Processing...'
        ) : (
          <>
            <CreditCard size={18} />
            <span>Proceed to Secure Checkout (₪{total.toFixed(2)})</span>
          </>
        )}
      </button>

      <div className="cart-security-badge">
        <Lock size={12} />
        <span>256-Bit Encrypted Secure Checkout</span>
      </div>
    </div>
  );
};
