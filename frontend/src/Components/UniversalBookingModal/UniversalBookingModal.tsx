import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { PetProfile } from '../../schemas';
import { BookingProviderHeader } from './Components/BookingProviderHeader';
import { BookingServiceSelector, type ServiceOption } from './Components/BookingServiceSelector';
import { BookingDateTimeSlots } from './Components/BookingDateTimeSlots';
import { BookingPetForm } from './Components/BookingPetForm';
import { Modal, Button } from '../UI';
import { API_URL } from '../../config/api';

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

  const modalTitle = (
    <BookingProviderHeader
      providerName={provider.name}
      providerType={provider.type}
      providerAvatar={provider.avatar}
      rating={provider.rating}
      badgeType={provider.badgeType}
    />
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="540px">
      {isConfirmed ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem' }}>Appointment Confirmed!</h3>
          <p style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem' }}>
            {selectedService?.name} with <strong>{provider.name}</strong> on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong>.
          </p>
          <p style={{ fontSize: '0.85rem', color: '#38bdf8', marginTop: '0.5rem' }}>
            ✓ Synced to your Profile Calendar & Shared Pet Co-Parents
          </p>
          <Button variant="primary" style={{ marginTop: '1.5rem' }} onClick={onClose} fullWidth>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!selectedService}
            >
              Confirm Booking {selectedService ? `(₪${selectedService.price})` : ''}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
