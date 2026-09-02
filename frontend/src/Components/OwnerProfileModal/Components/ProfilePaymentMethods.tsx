import React from 'react';
import { CreditCard, Plus, Trash2, Lock } from 'lucide-react';
import type { SavedCard } from '../OwnerProfileModal';

interface ProfilePaymentMethodsProps {
  savedCards: SavedCard[];
  showAddCard: boolean;
  setShowAddCard: (v: boolean) => void;
  newCardNumber: string;
  setNewCardNumber: (v: string) => void;
  newCardExpiry: string;
  setNewCardExpiry: (v: string) => void;
  newCardCvc: string;
  setNewCardCvc: (v: string) => void;
  newCardHolder: string;
  setNewCardHolder: (v: string) => void;
  onAddCardSubmit: (e: React.FormEvent) => void;
  onRemoveCard: (id: string) => void;
}

export const ProfilePaymentMethods: React.FC<ProfilePaymentMethodsProps> = ({
  savedCards,
  showAddCard,
  setShowAddCard,
  newCardNumber,
  setNewCardNumber,
  newCardExpiry,
  setNewCardExpiry,
  newCardCvc,
  setNewCardCvc,
  newCardHolder,
  setNewCardHolder,
  onAddCardSubmit,
  onRemoveCard,
}) => {
  return (
    <div className="owner-profile-cards-section">
      <div className="cards-header-row">
        <h4>
          <CreditCard size={16} /> Saved Payment Methods
        </h4>
        <button
          type="button"
          className="btn-add-card-toggle"
          onClick={() => setShowAddCard(!showAddCard)}
        >
          <Plus size={13} /> Add Card
        </button>
      </div>

      <div className="saved-cards-list">
        {savedCards.map((card) => (
          <div key={card.id} className="saved-card-row">
            <div className="card-brand-badge">{card.brand.toUpperCase()}</div>
            <div className="card-info">
              <span className="card-number-mask">•••• {card.last4}</span>
              <span className="card-expiry">
                Expires {card.expMonth}/{card.expYear}
              </span>
            </div>
            <button
              type="button"
              className="btn-delete-card"
              onClick={() => onRemoveCard(card.id)}
              title="Remove Card"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {savedCards.length === 0 && !showAddCard && (
          <div className="no-cards-msg">
            No payment cards saved yet. Add a card for instant 1-click triage & orders.
          </div>
        )}
      </div>

      {showAddCard && (
        <div className="add-card-embedded-form">
          <div className="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Full Name as on Card"
              value={newCardHolder}
              onChange={(e) => setNewCardHolder(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Card Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="•••• •••• •••• ••••"
              maxLength={19}
              value={newCardNumber}
              onChange={(e) => setNewCardNumber(e.target.value)}
            />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label>Expiry (MM/YY)</label>
              <input
                type="text"
                className="form-input"
                placeholder="12/28"
                maxLength={5}
                value={newCardExpiry}
                onChange={(e) => setNewCardExpiry(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>CVC / CVV</label>
              <input
                type="password"
                className="form-input"
                placeholder="•••"
                maxLength={4}
                value={newCardCvc}
                onChange={(e) => setNewCardCvc(e.target.value)}
              />
            </div>
          </div>
          <div className="add-card-actions">
            <button
              type="button"
              className="btn-save-new-card"
              onClick={onAddCardSubmit}
            >
              <Lock size={12} /> Save Card Encrypted
            </button>
            <button
              type="button"
              className="btn-cancel-new-card"
              onClick={() => setShowAddCard(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
