import React from 'react';
import type { PetProfile } from '../../../schemas';
import { Input, Select, Textarea } from '../../UI';

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
      {pets.length > 0 ? (
        <Select
          label="Select Pet for this Appointment"
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(e.target.value)}
        >
          {pets.map((p) => (
            <option key={p._id || p.petId} value={p._id || p.petId}>
              🐾 {p.name} ({p.species} · {p.breed})
            </option>
          ))}
          <option value="__guest__">➕ Other / New Pet Name...</option>
        </Select>
      ) : (
        <Input
          label="Pet Name"
          placeholder="e.g. Max"
          value={guestPetName}
          onChange={(e) => setGuestPetName(e.target.value)}
          required
        />
      )}

      {selectedPetId === '__guest__' && pets.length > 0 && (
        <Input
          label="Pet Name"
          placeholder="e.g. Bella"
          value={guestPetName}
          onChange={(e) => setGuestPetName(e.target.value)}
          required
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <Input
          label="Your Name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
        />
        <Input
          label="Phone Number"
          type="tel"
          value={ownerPhone}
          onChange={(e) => setOwnerPhone(e.target.value)}
          required
        />
      </div>

      <Textarea
        label="Special Care Notes / Symptoms (Optional)"
        rows={2}
        placeholder="Any sensitivities, medication notes, or special instructions..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
};
