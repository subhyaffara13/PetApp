import { useState, useEffect } from 'react';
import type { CartItem } from '../../schemas';
import { X, ShoppingBag, CheckCircle2 } from 'lucide-react';
import type { SavedCard } from '../OwnerProfileModal/OwnerProfileModal';
import { CheckoutModal } from '../CheckoutModal/CheckoutModal';
import { CartItemList } from './Components/CartItemList';
import { CartFulfillmentSection } from './Components/CartFulfillmentSection';
import { CartOrderSummary } from './Components/CartOrderSummary';
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

const SERVICE_FEE_RATE = 0.025;
const SAVED_CARDS_KEY = 'petsos_saved_cards_v1';

export const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onCheckout }: CartProps) => {
  const [fulfillmentMode, setFulfillmentMode] = useState<'delivery' | 'pickup'>('delivery');
  const [streetAddress, setStreetAddress] = useState('Moriah Blvd 42');
  const [city, setCity] = useState('Haifa');
  const [apt, setApt] = useState('Apt 4, Floor 2');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [, setSavedCards] = useState<SavedCard[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_CARDS_KEY);
      if (saved) setSavedCards(JSON.parse(saved));
    } catch {}
  }, [isOpen]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const serviceFee = subtotal * SERVICE_FEE_RATE;
  const deliveryFee = fulfillmentMode === 'delivery' ? 20 : 0;
  const total = subtotal + serviceFee + deliveryFee;

  const handleCheckoutComplete = (details: any) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOrderConfirmed(true);
      onCheckout({
        fulfillmentMode,
        deliveryFee,
        streetAddress,
        city,
        apt,
        paymentMethod: details.paymentMethod || 'card',
        paymentIntentId: details.paymentIntentId,
      });
      setTimeout(() => {
        setOrderConfirmed(false);
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <>
      {isOpen && <div className="cart-overlay" onClick={onClose} id="cart-overlay" />}
      <div className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`} id="cart-drawer">
        <div className="cart-drawer__header">
          <h3><ShoppingBag size={18} /> Shopping Cart</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close cart">
            <X size={18} />
          </button>
        </div>

        {orderConfirmed ? (
          <div className="cart-confirmed-view">
            <CheckCircle2 size={48} color="#10b981" />
            <h4>Order Confirmed!</h4>
            <p>Your receipt has been generated & emailed.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-drawer__empty">
            <ShoppingBag size={48} className="cart-empty-icon" />
            <p>Your shopping cart is empty</p>
            <button className="btn btn-primary btn-sm" onClick={onClose}>Explore Pet Store</button>
          </div>
        ) : (
          <div className="cart-drawer__body">
            <CartItemList items={items} onUpdateQuantity={onUpdateQuantity} />
            <CartFulfillmentSection
              fulfillmentMode={fulfillmentMode}
              setFulfillmentMode={setFulfillmentMode}
              streetAddress={streetAddress}
              setStreetAddress={setStreetAddress}
              city={city}
              setCity={setCity}
              apt={apt}
              setApt={setApt}
            />
            <CartOrderSummary
              subtotal={subtotal}
              serviceFee={serviceFee}
              deliveryFee={deliveryFee}
              total={total}
              isProcessing={isProcessing}
              onOpenCheckoutModal={() => setShowCheckoutModal(true)}
            />
          </div>
        )}
      </div>

      {showCheckoutModal && (
        <CheckoutModal
          items={items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            price: i.product.price,
            storeName: i.product.category || 'Pet Store',
          }))}
          totalAmount={total}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={(paymentIntentId) => handleCheckoutComplete({ paymentIntentId })}
        />
      )}
    </>
  );
};
