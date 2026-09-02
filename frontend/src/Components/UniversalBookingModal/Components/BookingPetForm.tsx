import React from 'react';
import type { PetProfile } from '../../../schemas';

interface BookingPetFormProps {
  pets: PetProfile[];
  selectedPetId: string;
  setSelectedPetId: (id: string) => void;
  guestPetName: string;
  setGuestPetName: (name: string) => void;
  ownerName: string;
  setOwnerName: (name: string) => void;
  ownerPhone: string;
  setOwnerPhone: (phone: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
}

export const BookingPetForm: React.FC<BookingPetFormProps> = ({
  pets,
  selectedPetId,
  setSelectedPetId,
  guestPetName,
  setGuestPetName,
  ownerName,
  setOwnerName,
  ownerPhone,
  setOwnerPhone,
  notes,
  setNotes,
}) => {
  return (
    <div className="booking-pet-form-group">
      <div className="form-group">
        <label className="booking-field-label">Select Pet for this Appointment</label>
        {pets.length > 0 ? (
          <select
            className="form-input"
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
          >
            {pets.map((p) => (
              <option key={p._id || p.petId} value={p._id || p.petId}>
                🐾 {p.name} ({p.species} · {p.breed})
              </option>
            ))}
            <option value="__guest__">➕ Other / New Pet Name...</option>
          </select>
        ) : (
          <input
            type="text"
            className="form-input"
            placeholder="Pet Name (e.g. Max)"
            value={guestPetName}
            onChange={(e) => setGuestPetName(e.target.value)}
            required
          />
        )}
      </div>

      {selectedPetId === '__guest__' && pets.length > 0 && (
        <div className="form-group animate-slide-down">
          <label className="booking-field-label">Pet Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Bella"
            value={guestPetName}
            onChange={(e) => setGuestPetName(e.target.value)}
            required
          />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="booking-field-label">Your Name</label>
          <input
            type="text"
            className="form-input"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="booking-field-label">Phone Number</label>
          <input
            type="tel"
            className="form-input"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="booking-field-label">Special Care Notes / Symptoms (Optional)</label>
        <textarea
          rows={2}
          className="form-input"
          placeholder="Any sensitivities, medication notes, or special instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
};
