import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { PetProfile } from '../../schemas';
import { BookingProviderHeader } from './Components/BookingProviderHeader';
import { BookingServiceSelector, type ServiceOption } from './Components/BookingServiceSelector';
import { BookingDateTimeSlots } from './Components/BookingDateTimeSlots';
import { BookingPetForm } from './Components/BookingPetForm';
import { API_URL } from '../../config/api';
import './UniversalBookingModal.css';

export interface BookingProviderContext {
  id: string;
  name: string;
  type: 'veterinarian' | 'groomer' | 'dog_walker' | 'pet_sitter' | 'clinic';
  avatar?: string;
  phone?: string;
  rating?: number;
  badgeType?: string;
}

interface UniversalBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: BookingProviderContext | null;
  onSuccess?: () => void;
}

export const UniversalBookingModal: React.FC<UniversalBookingModalProps> = ({
  isOpen,
  onClose,
  provider,
  onSuccess,
}) => {
  if (!isOpen || !provider) return null;

  const { user } = useAuth();
  const { showToast } = useToast();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [guestPetName, setGuestPetName] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [ownerPhone, setOwnerPhone] = useState(() => localStorage.getItem('petsos_user_phone') || '054-123-4567');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    axios.get<PetProfile[]>(`${API_URL}/pet-profile`)
      .then((res) => {
        if (res.data?.length > 0) {
          setPets(res.data);
          setSelectedPetId(res.data[0]._id || res.data[0].petId || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return showToast('Please select a visit service', 'error');

    const activePet = pets.find((p) => (p._id || p.petId) === selectedPetId);
    const finalPetName = activePet ? activePet.name : guestPetName || 'Pet';

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/schedule/appointments/book`, {
        petId: activePet ? activePet._id : 'general',
        petPassportId: activePet?.petId,
        petName: finalPetName,
        petSpecies: activePet?.species || 'dog',
        providerType: provider.type,
        providerId: provider.id,
        providerName: provider.name,
        providerAvatar: provider.avatar,
        providerPhone: provider.phone,
        serviceName: selectedService.name,
        serviceCategory: selectedService.category,
        price: selectedService.price,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        ownerName,
        ownerPhone,
        notes,
      });

      setIsConfirmed(true);
      showToast('Appointment booked & added to your Pet Care Calendar!', 'success');
      onSuccess?.();
    } catch {
      showToast('Failed to schedule appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="booking-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="booking-modal-card card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <BookingProviderHeader
            providerName={provider.name}
            providerType={provider.type}
            providerAvatar={provider.avatar}
            rating={provider.rating}
            badgeType={provider.badgeType}
          />
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        {isConfirmed ? (
          <div className="booking-confirmation-view animate-fade-in" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h3>Appointment Confirmed!</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {selectedService?.name} with <strong>{provider.name}</strong> on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong>.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#38bdf8', marginTop: '0.5rem' }}>
              ✓ Synced to your Profile Calendar & Shared Pet Co-Parents
            </p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-modal-form">
            <BookingServiceSelector
              providerType={provider.type}
              selectedService={selectedService}
              onSelectService={setSelectedService}
            />

            <BookingDateTimeSlots
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
            />

            <BookingPetForm
              pets={pets}
              selectedPetId={selectedPetId}
              setSelectedPetId={setSelectedPetId}
              guestPetName={guestPetName}
              setGuestPetName={setGuestPetName}
              ownerName={ownerName}
              setOwnerName={setOwnerName}
              ownerPhone={ownerPhone}
              setOwnerPhone={setOwnerPhone}
              notes={notes}
              setNotes={setNotes}
            />

            <div className="booking-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || !selectedService}>
                {isSubmitting ? 'Booking...' : `Confirm Booking ${selectedService ? `(₪${selectedService.price})` : ''}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
