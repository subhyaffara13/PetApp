import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import type { PetProfile } from '../../schemas';
import { PetCareCalendar } from '../PetCareCalendar/PetCareCalendar';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';
import './GlobalCalendarModal.css';

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

  if (!isOpen) return null;

  return (
    <div className="global-calendar-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="global-calendar-modal-card card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="global-calendar-modal-header">
          <div className="global-header-title">
            <CalendarIcon size={22} color="#38bdf8" />
            <div>
              <h3>All Pets Care Schedule & Appointments</h3>
              <p>Unified family agenda across all your registered and co-parented pets</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="global-calendar-modal-body">
          <PetCareCalendar
            pets={pets}
            userId={user?.id}
          />
        </div>
      </div>
    </div>
  );
};
