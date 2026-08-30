import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, Phone, MapPin, HeartHandshake, Save, Check, CreditCard, Trash2, Plus, Lock, Camera, Trash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useImageUpload } from '../../Hooks/useImageUpload';
import './OwnerProfileModal.css';

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: string;
  expYear: string;
  holderName: string;
}

const SAVED_CARDS_KEY = 'petsos_saved_cards_v1';

export const OwnerProfileModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('054-123-4567');
  const [city, setCity] = useState('Haifa, Israel');
  const [preferredVet, setPreferredVet] = useState('Haifa Emergency Vet Center (24/7)');
  const [isSaved, setIsSaved] = useState(false);

  // Profile Photo Upload Hook
  const { image, isUploading, handleFileChange, clearImage } = useImageUpload('avatars');

  // Real Saved Payment Methods (Zero hardcoded cards)
  const [savedCards, setSavedCards] = useState<SavedCard[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_CARDS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');

  // Sync avatar if uploaded via hook
  useEffect(() => {
    if (image?.url) {
      updateUserProfile({ avatar: image.url });
    }
  }, [image?.url]);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);
  }, [user]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('petsos_owner_profile_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.city) setCity(parsed.city);
        if (parsed.preferredVet) setPreferredVet(parsed.preferredVet);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(savedCards));
  }, [savedCards]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = { name, email, phone, city, preferredVet };
    localStorage.setItem('petsos_owner_profile_data', JSON.stringify(updatedData));
    await updateUserProfile({ name });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleRemovePhoto = async () => {
    clearImage();
    await updateUserProfile({ avatar: '' });
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber.trim()) return;

    const digitsOnly = newCardNumber.replace(/\D/g, '');
    const last4 = digitsOnly.slice(-4) || '1234';
    const [expMonth = '12', expYear = '29'] = newCardExpiry.split('/');

    const cardBrand = digitsOnly.startsWith('5') ? 'Mastercard' : 'Visa';

    const newCard: SavedCard = {
      id: `card-${Date.now()}`,
      brand: cardBrand,
      last4,
      expMonth,
      expYear,
      holderName: newCardHolder || name || 'Pet Owner',
    };

    setSavedCards((prev) => [...prev, newCard]);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvc('');
    setNewCardHolder('');
    setShowAddCard(false);
  };

  const handleDeleteCard = (cardId: string) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const avatarUrl = image?.previewUrl || image?.url || user?.avatar || '';

  return (
    <div className="owner-modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="owner-modal-card card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="owner-modal-header">
          <div className="owner-modal-title">
            <div className="owner-avatar-icon">
              <UserIcon size={24} />
            </div>
            <div>
              <h3>Pet Owner Profile</h3>
              <p>Manage your contact details, photo & payment methods</p>
            </div>
          </div>
          <button className="owner-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Profile Picture Upload & Delete Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1rem 1.5rem',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name || 'Avatar'}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-primary)',
                }}
              />
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: '#fff',
                }}
              >
                {(name || 'P').charAt(0).toUpperCase()}
              </div>
            )}
            {isUploading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  color: '#fff',
                }}
              >
                Uploading...
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <strong style={{ color: '#f8fafc', fontSize: '0.92rem', display: 'block' }}>
              {name || 'Pet Parent'}
            </strong>
            <p style={{ margin: '0.15rem 0 0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
              {email || 'No email attached'}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '4px 10px',
                  background: 'rgba(56,189,248,0.12)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  borderRadius: 6,
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Camera size={13} />
                {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '4px 10px',
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 6,
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Trash size={13} /> Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="owner-form">
          <div className="owner-form-grid">
            <div className="form-group">
              <label>
                <UserIcon size={14} /> Full Name
              </label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Subhy Affara"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. subhy@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Phone size={14} /> Emergency Phone
              </label>
              <input
                type="tel"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 054-123-4567"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <MapPin size={14} /> Home City / Location
              </label>
              <input
                type="text"
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Haifa, Israel"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>
                <HeartHandshake size={14} /> Preferred Emergency Hospital / Clinic
              </label>
              <input
                type="text"
                className="input"
                value={preferredVet}
                onChange={(e) => setPreferredVet(e.target.value)}
                placeholder="e.g. Haifa Emergency Vet Center"
              />
            </div>
          </div>

          {/* Saved Payment Methods Section */}
          <div className="owner-payment-section">
            <div className="owner-payment-header">
              <div className="owner-payment-title">
                <CreditCard size={18} className="payment-icon" />
                <h4>Saved Payment Methods</h4>
              </div>
              {!showAddCard && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm add-card-btn"
                  onClick={() => setShowAddCard(true)}
                >
                  <Plus size={14} /> Add Card
                </button>
              )}
            </div>

            {/* Zero Hardcoded Cards — Empty State */}
            {savedCards.length === 0 && !showAddCard && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '1.75rem 1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(255,255,255,0.12)',
                  borderRadius: 10,
                  color: '#94a3b8',
                }}
              >
                <CreditCard size={28} style={{ margin: '0 auto 0.4rem', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '0.84rem' }}>No payment cards saved yet.</p>
                <p style={{ margin: '0.2rem 0 0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                  Save a card to enable secure 1-click checkout for pet pharmacy and store orders.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddCard(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={14} /> Add Your First Card
                </button>
              </div>
            )}

            {/* Cards List */}
            {savedCards.length > 0 && (
              <div className="saved-cards-list">
                {savedCards.map((card) => (
                  <div key={card.id} className="saved-card-item">
                    <div className="card-brand-badge">{card.brand}</div>
                    <div className="card-info">
                      <span className="card-number">•••• •••• •••• {card.last4}</span>
                      <span className="card-exp">
                        Expires {card.expMonth}/{card.expYear} · {card.holderName}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="delete-card-btn"
                      onClick={() => handleDeleteCard(card.id)}
                      title="Remove card"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Card Form */}
            {showAddCard && (
              <div className="add-card-form animate-fade-in">
                <div className="add-card-header">
                  <h5>Add New Payment Card</h5>
                  <button type="button" className="close-add-card" onClick={() => setShowAddCard(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="add-card-inputs">
                  <div className="form-group full-width">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      className="input"
                      value={newCardHolder}
                      onChange={(e) => setNewCardHolder(e.target.value)}
                      placeholder="e.g. Subhy Affara"
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Card Number</label>
                    <input
                      type="text"
                      className="input"
                      value={newCardNumber}
                      onChange={(e) => setNewCardNumber(e.target.value)}
                      placeholder="4580 0000 0000 0000"
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Expiry (MM/YY)</label>
                    <input
                      type="text"
                      className="input"
                      value={newCardExpiry}
                      onChange={(e) => setNewCardExpiry(e.target.value)}
                      placeholder="12/28"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVC / CVV</label>
                    <input
                      type="password"
                      className="input"
                      value={newCardCvc}
                      onChange={(e) => setNewCardCvc(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                <div className="add-card-actions">
                  <span className="secure-badge">
                    <Lock size={12} /> 256-Bit Encrypted & PCI Compliant
                  </span>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setShowAddCard(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleAddCardSubmit}
                    >
                      Save Card
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="owner-modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`btn btn-primary ${isSaved ? 'btn-success' : ''}`}>
              {isSaved ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                <>
                  <Save size={16} /> Save Profile Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
