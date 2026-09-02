import React, { useState, useEffect } from 'react';
import { X, Save, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useImageUpload } from '../../Hooks/useImageUpload';
import { ProfileAvatarSection } from './Components/ProfileAvatarSection';
import { ProfileContactFields } from './Components/ProfileContactFields';
import { ProfilePaymentMethods } from './Components/ProfilePaymentMethods';
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

  const { image, isUploading, handleFileChange, clearImage } = useImageUpload('avatars');

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

  useEffect(() => {
    if (image?.url) updateUserProfile({ avatar: image.url });
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
    const [expMonth, expYear] = newCardExpiry.includes('/') ? newCardExpiry.split('/') : ['12', '28'];

    const newCard: SavedCard = {
      id: `card_${Date.now()}`,
      brand: digitsOnly.startsWith('4') ? 'visa' : digitsOnly.startsWith('5') ? 'mastercard' : 'card',
      last4,
      expMonth: expMonth.trim(),
      expYear: expYear ? expYear.trim() : '28',
      holderName: newCardHolder || name || 'Pet Parent',
    };

    setSavedCards((prev) => [...prev, newCard]);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvc('');
    setNewCardHolder('');
    setShowAddCard(false);
  };

  const handleRemoveCard = (id: string) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="owner-profile-modal-backdrop" onClick={onClose}>
      <div className="owner-profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="owner-profile-modal-header">
          <div>
            <h3>Pet Parent Profile & Billing</h3>
            <p className="owner-profile-sub">Primary contact & payment details for emergency clinics</p>
          </div>
          <button className="owner-profile-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSaveProfile} className="owner-profile-form">
          <ProfileAvatarSection
            currentAvatar={user?.avatar || image?.url}
            isUploading={isUploading}
            onFileChange={handleFileChange}
            onRemovePhoto={handleRemovePhoto}
          />

          <ProfileContactFields
            name={name}
            setName={setName}
            email={email}
            phone={phone}
            setPhone={setPhone}
            city={city}
            setCity={setCity}
            preferredVet={preferredVet}
            setPreferredVet={setPreferredVet}
          />

          <ProfilePaymentMethods
            savedCards={savedCards}
            showAddCard={showAddCard}
            setShowAddCard={setShowAddCard}
            newCardNumber={newCardNumber}
            setNewCardNumber={setNewCardNumber}
            newCardExpiry={newCardExpiry}
            setNewCardExpiry={setNewCardExpiry}
            newCardCvc={newCardCvc}
            setNewCardCvc={setNewCardCvc}
            newCardHolder={newCardHolder}
            setNewCardHolder={setNewCardHolder}
            onAddCardSubmit={handleAddCardSubmit}
            onRemoveCard={handleRemoveCard}
          />

          <div className="owner-profile-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-save-profile">
              {isSaved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
