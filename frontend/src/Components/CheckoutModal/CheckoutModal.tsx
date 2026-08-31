import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShoppingBag, Lock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/api';

const stripeKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51TkD1WQ2yoEXOvhx83mDkX2gOFw5rjOelgKCcSlRd7z2zuS1ESWe7D3ncHjW4HNgvUm7raN5Eve6y00iFCS1xMc';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface CheckoutItem {
  name: string;
  quantity: number;
  price: number;
  storeName: string;
}

interface CheckoutModalProps {
  items: CheckoutItem[];
  totalAmount: number; // in NIS (ILS), cents will be calculated
  onClose: () => void;
  onSuccess: (paymentIntentId: string) => void;
}

// Inner form — rendered inside <Elements> context
const CheckoutForm: React.FC<{ totalAmount: number; onSuccess: (id: string) => void; onClose: () => void }> = ({ totalAmount, onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMsg(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMsg(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else if (paymentIntent?.status === 'succeeded') {
      setSucceeded(true);
      setTimeout(() => onSuccess(paymentIntent.id), 1500);
    }
  };

  if (succeeded) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: '#10b981', margin: '0 0 0.5rem' }}>Payment Successful!</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Your order has been placed. You'll receive a confirmation shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />

      {errorMsg && (
        <div style={{ marginTop: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.65rem 0.85rem', color: '#ef4444', fontSize: '0.83rem' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--color-text)', borderRadius: 10, fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>
          Cancel
        </button>
        <button type="submit" disabled={!stripe || isProcessing} style={{ flex: 2, padding: '0.75rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 10, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isProcessing ? 0.7 : 1 }}>
          <Lock size={15} />
          {isProcessing ? 'Processing...' : `Pay ₪${totalAmount.toFixed(2)}`}
        </button>
      </div>
      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
        🔒 Secured by Stripe · Test card: 4242 4242 4242 4242
      </p>
    </form>
  );
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ items, totalAmount, onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(true);
  const [intentError, setIntentError] = useState<string | null>(null);

  useEffect(() => {
    const amountInCents = Math.round(totalAmount * 100);
    axios.post(`${API_URL}/marketplace/payment-intent`, { amount: amountInCents, currency: 'ils' })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch(() => setIntentError('Could not initialize payment. Please try again.'))
      .finally(() => setIsLoadingIntent(false));
  }, [totalAmount]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <ShoppingBag size={22} color="var(--color-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Complete Your Order</h3>
        </div>

        {/* Order Summary */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '0.85rem', marginBottom: '1.25rem' }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0', borderBottom: i < items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <span>{item.quantity}× {item.name} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>({item.storeName})</span></span>
              <span style={{ fontWeight: 700 }}>₪{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '2px solid var(--color-border)', fontSize: '1rem' }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>₪{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Form */}
        {isLoadingIntent && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Initializing secure payment...</p>}
        {intentError && <p style={{ textAlign: 'center', color: '#ef4444' }}>{intentError}</p>}
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#38bdf8' } } }}>
            <CheckoutForm totalAmount={totalAmount} onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        )}
      </div>
    </div>
  );
};
