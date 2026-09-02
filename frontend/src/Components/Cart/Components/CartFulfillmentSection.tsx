import React from 'react';

interface CartFulfillmentSectionProps {
  fulfillmentMode: 'delivery' | 'pickup';
  setFulfillmentMode: (mode: 'delivery' | 'pickup') => void;
  streetAddress: string;
  setStreetAddress: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  apt: string;
  setApt: (val: string) => void;
}

export const CartFulfillmentSection: React.FC<CartFulfillmentSectionProps> = ({
  fulfillmentMode,
  setFulfillmentMode,
  streetAddress,
  setStreetAddress,
  city,
  setCity,
  apt,
  setApt,
}) => {
  return (
    <div className="cart-fulfillment-box">
      <div className="fulfillment-toggle">
        <button
          type="button"
          className={`fulfillment-btn ${fulfillmentMode === 'delivery' ? 'active' : ''}`}
          onClick={() => setFulfillmentMode('delivery')}
        >
          🛵 Express Wolt Delivery (₪20)
        </button>
        <button
          type="button"
          className={`fulfillment-btn ${fulfillmentMode === 'pickup' ? 'active' : ''}`}
          onClick={() => setFulfillmentMode('pickup')}
        >
          🏪 Self Pickup (Free)
        </button>
      </div>

      {fulfillmentMode === 'delivery' && (
        <div className="delivery-address-form">
          <div className="address-row">
            <input
              type="text"
              placeholder="Street and Number"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              className="address-input"
            />
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="address-input city-input"
            />
          </div>
          <input
            type="text"
            placeholder="Apartment, Floor, Entry Code"
            value={apt}
            onChange={(e) => setApt(e.target.value)}
            className="address-input"
          />
        </div>
      )}
    </div>
  );
};
