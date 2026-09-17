import React from 'react';
import { User, Phone, Mail, Sparkles, LogIn } from 'lucide-react';
import type { PetProfile } from '../../../schemas';
import { Input, Select, Textarea } from '../../UI';

interface BookingPetFormProps {
  isLoggedIn: boolean;
  pets: PetProfile[];
  selectedPetId: string;
  setSelectedPetId: (id: string) => void;
  guestPetName: string;
  setGuestPetName: (name: string) => void;
  ownerName: string;
  setOwnerName: (name: string) => void;
  ownerEmail: string;
  setOwnerEmail: (email: string) => void;
  ownerPhone: string;
  setOwnerPhone: (phone: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onOpenLogin?: () => void;
}

export const BookingPetForm: React.FC<BookingPetFormProps> = ({
  isLoggedIn,
  pets,
  selectedPetId,
  setSelectedPetId,
  guestPetName,
  setGuestPetName,
  ownerName,
  setOwnerName,
  ownerEmail,
  setOwnerEmail,
  ownerPhone,
  setOwnerPhone,
  notes,
  setNotes,
  onOpenLogin,
}) => {
  return (
    <div className="booking-pet-form-group">
      {/* Login vs Guest header banner */}
      {!isLoggedIn ? (
        <div className="booking-guest-banner">
          <div className="booking-guest-banner__info">
            <Sparkles size={16} className="text-amber-400" />
            <span>Booking as a Guest</span>
          </div>
          {onOpenLogin && (
            <button
              type="button"
              className="booking-guest-banner__btn"
              onClick={onOpenLogin}
            >
              <LogIn size={14} /> Log in to auto-fill & pick pets
            </button>
          )}
        </div>
      ) : (
        <div className="booking-logged-banner">
          <span className="booking-logged-badge">✓ Logged In</span>
          <span className="booking-logged-text">
            Auto-filling contact details from your PetSOS profile
          </span>
        </div>
      )}

      {/* Pet Selection (Logged in with pets vs Guest / New pet) */}
      {isLoggedIn && pets.length > 0 ? (
        <div className="booking-pet-select-container">
          <Select
            label="Choose Pet from Your Profile"
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
          >
            {pets.map((p) => (
              <option key={p._id || p.petId} value={p._id || p.petId}>
                🐾 {p.name} ({p.species} · {p.breed || 'Companion'})
              </option>
            ))}
            <option value="__guest__">➕ Other / New Pet Name...</option>
          </Select>

          {selectedPetId === '__guest__' && (
            <div style={{ marginTop: '0.65rem' }}>
              <Input
                label="Enter Pet Name"
                inlaid
                value={guestPetName}
                onChange={(e) => setGuestPetName(e.target.value)}
                required
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <Input
            label="Pet Name"
            inlaid
            value={guestPetName}
            onChange={(e) => setGuestPetName(e.target.value)}
            required
          />
        </div>
      )}

      {/* Owner Contact Information */}
      <div style={{ display: 'grid', gridTemplateColumns: isLoggedIn ? '1fr 1fr' : '1fr 1fr', gap: '0.75rem' }}>
        <Input
          label="Your Full Name"
          inlaid
          leftIcon={<User size={16} />}
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          inlaid
          leftIcon={<Phone size={16} />}
          value={ownerPhone}
          onChange={(e) => setOwnerPhone(e.target.value)}
          required
        />
      </div>

      {/* Email input (Required for Guest, auto-filled for logged in) */}
      <Input
        label="Confirmation Email"
        type="email"
        inlaid
        leftIcon={<Mail size={16} />}
        value={ownerEmail}
        onChange={(e) => setOwnerEmail(e.target.value)}
        required
      />

      {/* Visit notes */}
      <Textarea
        label="Special Care Notes / Symptoms (Optional)"
        rows={2}
        placeholder="Any sensitivities, medication notes, or special symptoms..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
};
