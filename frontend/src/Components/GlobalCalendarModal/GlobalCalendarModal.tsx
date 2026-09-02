import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { PetProfile } from '../../schemas';
import { PetCareCalendar } from '../PetCareCalendar/PetCareCalendar';
import { Modal } from '../UI';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

interface GlobalCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalCalendarModal: React.FC<GlobalCalendarModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<PetProfile[]>([]);

  useEffect(() => {
    if (isOpen) {
      axios.get<PetProfile[]>(`${API_URL}/pet-profile`)
        .then((res) => { if (res.data?.length > 0) setPets(res.data); })
        .catch(() => {});
    }
  }, [isOpen]);

  const modalTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <CalendarIcon size={20} color="#38bdf8" />
      <div>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, display: 'block' }}>All Pets Care Schedule</span>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>Family agenda synced across co-parents</span>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="880px"
    >
      <PetCareCalendar
        pets={pets}
        userId={user?.id}
      />
    </Modal>
  );
};
