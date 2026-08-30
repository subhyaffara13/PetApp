import { useState, useEffect } from 'react';
import type { CartItem } from '../../schemas';
import { X, Minus, Plus, ShoppingBag, CreditCard, CheckCircle2, Lock, Check } from 'lucide-react';
import type { SavedCard } from '../OwnerProfileModal/OwnerProfileModal';
import { CheckoutModal } from '../CheckoutModal/CheckoutModal';
import './Cart.css';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onCheckout: (details?: {
    fulfillmentMode: 'delivery' | 'pickup';
    deliveryFee: number;
    streetAddress: string;
    city: string;
    apt: string;
    paymentMethod: string;
    paymentIntentId?: string;
  }) => void | Promise<void>;
}

const SERVICE_FEE_RATE = 0.025; // 2.5%
const SAVED_CARDS_KEY = 'petsos_saved_cards_v1';

type PaymentMethod = 'stripe' | 'bit' | 'apple_pay' | 'google_pay' | string;

export const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onCheckout }: CartProps) => {
  const [fulfillmentMode, setFulfillmentMode] = useState<'delivery' | 'pickup'>('delivery');
  const [streetAddress, setStreetAddress] = useState('Moriah Blvd 42');
  const [city, setCity] = useState('Haifa');
  const [apt, setApt] = useState('Apt 4, Floor 2');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');
  const [saveCardForFuture, setSaveCardForFuture] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_CARDS_KEY);
      if (saved) {
        setSavedCards(JSON.parse(saved));
      }
    } catch {}
  }, [isOpen]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const deliveryFee = fulfillmentMode === 'delivery' ? 20 : 0;
  const total = subtotal + serviceFee + deliveryFee;

  const handleCheckoutClick = () => {
    setIsProcessing(true);

    // If checkbox is ticked and user used Tranzila/Cardcom or Credit Card, save to profile
    if (saveCardForFuture && selectedMethod !== 'bit' && selectedMethod !== 'apple_pay' && selectedMethod !== 'google_pay') {
      const existing = savedCards.some((c) => c.last4 === '4242');
      if (!existing) {
        const newCard: SavedCard = {
          id: `card-${Date.now()}`,
          brand: 'Visa',
          last4: '4242',
          expMonth: '12',
          expYear: '28',
          holderName: 'Pet Owner',
        };
        const updated = [...savedCards, newCard];
        localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(updated));
        setSavedCards(updated);
      }
    }

    setTimeout(() => {
      setIsProcessing(false);
      setOrderConfirmed(true);
      onCheckout({
        fulfillmentMode,
        deliveryFee,
        streetAddress,
        city,
        apt,
        paymentMethod: selectedMethod,
      });
      setTimeout(() => {
        setOrderConfirmed(false);
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose} id="cart-overlay" />}
      <div className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`} id="cart-drawer">
        <div className="cart-drawer__header">
          <h3><ShoppingBag size={18} /> Shopping Cart</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close cart" id="cart-close-btn">
            <X size={18} />
          </button>
        </div>

        {orderConfirmed ? (
          <div className="cart-success animate-fade-in">
            <CheckCircle2 size={48} className="cart-success-icon" />
            <h3>Order Confirmed! 🐾</h3>
            <p>Your payment of <strong>₪{total.toFixed(2)}</strong> (inc. 2.5% service fee) was processed via <strong>{selectedMethod.toUpperCase()}</strong>.</p>
            {saveCardForFuture && (
              <span className="cart-success-badge">
                <Check size={12} /> Payment method saved to your profile
              </span>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={40} />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.product._id} className="cart-item">
                  <div className="cart-item__info">
                    <h4>{item.product.name}</h4>
                    <span className="cart-item__price">₪{item.product.price.toFixed(2)}</span>
                  </div>
                  <div className="cart-item__qty">
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => onUpdateQuantity(item.product._id!, -1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => onUpdateQuantity(item.product._id!, 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Fulfillment Mode: Delivery vs. Pickup */}
            <div className="cart-fulfillment-box">
              <span className="cart-payment-label">📦 Delivery & Fulfillment Mode</span>
              <div className="fulfillment-options-row">
                <button
                  type="button"
                  className={`btn-fulfill-opt ${fulfillmentMode === 'delivery' ? 'btn-fulfill-opt--active' : ''}`}
                  onClick={() => setFulfillmentMode('delivery')}
                >
                  🛵 DaaS Courier Delivery (+₪20)
                </button>
                <button
                  type="button"
                  className={`btn-fulfill-opt ${fulfillmentMode === 'pickup' ? 'btn-fulfill-opt--active' : ''}`}
                  onClick={() => setFulfillmentMode('pickup')}
                >
                  🛍️ Store Pickup (Free)
                </button>
              </div>

              {fulfillmentMode === 'delivery' ? (
                <div className="cart-address-fields">
                  <input
                    type="text"
                    placeholder="Street & House No. (e.g. Moriah Blvd 42)"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="cart-addr-input"
                  />
                  <div className="cart-addr-row">
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="cart-addr-input"
                    />
                    <input
                      type="text"
                      placeholder="Apartment / Floor"
                      value={apt}
                      onChange={(e) => setApt(e.target.value)}
                      className="cart-addr-input"
                    />
                  </div>
                </div>
              ) : (
                <p className="pickup-notice-text">
                  📍 Pick up your items directly at the store counter once preparation is completed.
                </p>
              )}
            </div>

            {/* Saved Cards Available Header */}
            {savedCards.length > 0 && (
              <div className="cart-saved-cards-bar">
                <span className="cart-payment-label">
                  <CreditCard size={12} /> Saved Profile Cards
                </span>
                <div className="cart-saved-cards-list">
                  {savedCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      className={`payment-method-btn ${selectedMethod === `card-${card.id}` ? 'payment-method-btn--active' : ''}`}
                      onClick={() => setSelectedMethod(`card-${card.id}`)}
                    >
                      💳 {card.brand} •••• {card.last4}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Israeli Payment Gateways Selection */}
            <div className="cart-payment-selector">
              <span className="cart-payment-label">
                <Lock size={12} /> Israeli Payment Gateways (In-App)
              </span>
              <div className="cart-payment-methods">
                <button
                  type="button"
                  className={`payment-method-btn ${selectedMethod === 'bit' ? 'payment-method-btn--active' : ''}`}
                  onClick={() => setSelectedMethod('bit')}
                  id="pay-bit-btn"
                >
                  <span className="payment-flag">🇮🇱</span> Bit (Israel)
                </button>
                <button
                  type="button"
                  className={`payment-method-btn ${selectedMethod === 'stripe' ? 'payment-method-btn--active' : ''}`}
                  onClick={() => setSelectedMethod('stripe')}
                  id="pay-stripe-btn"
                >
                  <CreditCard size={14} /> Credit Card (Stripe)
                </button>
                <button
                  type="button"
                  className={`payment-method-btn ${selectedMethod === 'bit' ? 'payment-method-btn--active' : ''}`}
                  onClick={() => setSelectedMethod('bit')}
                  id="pay-bit-btn"
                >
                  <span className="payment-flag">🇮🇱</span> Bit (Israel)
                </button>
                <button
                  type="button"
                  className={`payment-method-btn ${selectedMethod === 'google_pay' ? 'payment-method-btn--active' : ''}`}
                  onClick={() => setSelectedMethod('google_pay')}
                  id="pay-google-btn"
                >
                  🌐 Google Pay
                </button>
              </div>

              {/* Save Details Checkbox */}
              <label className="save-card-checkbox-label">
                <input
                  type="checkbox"
                  checked={saveCardForFuture}
                  onChange={(e) => setSaveCardForFuture(e.target.checked)}
                  id="save-card-checkbox"
                />
                <span>Save card details for 1-click checkout (Stripe Vault)</span>
              </label>
            </div>

            <div className="cart-summary">
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>₪{subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary__row cart-summary__row--fee">
                <span>Service Fee (2.5%)</span>
                <span>₪{serviceFee.toFixed(2)}</span>
              </div>
              <div className="cart-summary__row cart-summary__row--fee">
                <span>{fulfillmentMode === 'delivery' ? '🛵 DaaS Courier Delivery' : '🛍️ Store Pickup'}</span>
                <span>{fulfillmentMode === 'delivery' ? '₪20.00' : 'FREE (₪0.00)'}</span>
              </div>
              <div className="cart-summary__row cart-summary__row--total">
                <span>Total</span>
                <span>₪{total.toFixed(2)}</span>
              </div>

              <button
                className="btn btn-primary btn-lg cart-checkout-btn"
                onClick={() => {
                  if (selectedMethod === 'stripe') {
                    setShowCheckoutModal(true);
                  } else {
                    handleCheckoutClick();
                  }
                }}
                disabled={isProcessing}
                id="cart-checkout-submit-btn"
              >
                {isProcessing
                  ? 'Processing Payment...'
                  : selectedMethod === 'stripe'
                  ? `Pay ₪${total.toFixed(2)} with Card`
                  : `Pay ₪${total.toFixed(2)} with ${selectedMethod.toUpperCase()}`}
              </button>
            </div>
          </>
        )}
      </div>

      {showCheckoutModal && (
        <CheckoutModal
          items={items.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            storeName: item.product.shopId || 'Partner Store',
          }))}
          totalAmount={total}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={(paymentIntentId) => {
            setShowCheckoutModal(false);
            setOrderConfirmed(true);
            onCheckout({
              fulfillmentMode,
              deliveryFee,
              streetAddress,
              city,
              apt,
              paymentMethod: `stripe_${paymentIntentId.slice(-6)}`,
              paymentIntentId,
            });
            setTimeout(() => {
              setOrderConfirmed(false);
              onClose();
            }, 2000);
          }}
        />
      )}
    </>
  );
};
