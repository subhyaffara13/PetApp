import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import type { PetProfile, Appointment, Reminder } from '../../schemas';
import { PetLegendBar } from './Components/PetLegendBar';
import { MonthCalendarGrid } from './Components/MonthCalendarGrid';
import { RemindersAgendaList } from './Components/RemindersAgendaList';
import { AddReminderModal } from './Components/AddReminderModal';
import { API_URL } from '../../config/api';
import './PetCareCalendar.css';

interface PetCareCalendarProps {
  pets?: PetProfile[];
  currentPetId?: string; // If provided, locks calendar to specific pet
  userId?: string;
}

export const PetCareCalendar: React.FC<PetCareCalendarProps> = ({
  pets = [],
  currentPetId,
  userId,
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedPetFilter, setSelectedPetFilter] = useState<string>(currentPetId || 'all');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  const getPetColor = (pet: PetProfile) => {
    if (pet.species === 'cat') return '#0ea5e9'; // Blue
    if (pet.species === 'bird') return '#10b981'; // Green
    if (pet.species === 'small_mammal') return '#a855f7'; // Purple
    return '#f97316'; // Orange for dog
  };

  const fetchScheduleData = useCallback(async () => {
    try {
      if (currentPetId) {
        const [apptsRes, remsRes] = await Promise.all([
          axios.get<Appointment[]>(`${API_URL}/schedule/appointments/pet/${currentPetId}`),
          axios.get<Reminder[]>(`${API_URL}/schedule/reminders/pet/${currentPetId}`),
        ]);
        setAppointments(apptsRes.data || []);
        setReminders(remsRes.data || []);
      } else {
        const effectiveUserId = userId || 'all';
        const [apptsRes, remsRes] = await Promise.all([
          axios.get<Appointment[]>(`${API_URL}/schedule/appointments/user/${effectiveUserId}`),
          axios.get<Reminder[]>(`${API_URL}/schedule/reminders/user/${effectiveUserId}`),
        ]);
        setAppointments(apptsRes.data || []);
        setReminders(remsRes.data || []);
      }
    } catch {}
  }, [currentPetId, userId]);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  const filteredAppts = appointments.filter(
    (a) => selectedPetFilter === 'all' || a.petId === selectedPetFilter
  );
  const filteredReminders = reminders.filter(
    (r) => selectedPetFilter === 'all' || r.petId === selectedPetFilter
  );

  const handleToggleReminder = async (id: string) => {
    try {
      const res = await axios.patch<Reminder>(`${API_URL}/schedule/reminders/${id}/toggle`);
      setReminders((prev) => prev.map((r) => (r._id === id ? res.data : r)));
    } catch {}
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/schedule/reminders/${id}`);
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch {}
  };

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await axios.patch(`${API_URL}/schedule/appointments/${id}/cancel`);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch {}
  };

  const handleAddReminder = async (dto: any) => {
    try {
      const res = await axios.post<Reminder>(`${API_URL}/schedule/reminders`, dto);
      setReminders((prev) => [...prev, res.data]);
    } catch {}
  };

  return (
    <div className="pet-care-calendar-container card">
      <div className="calendar-top-controls">
        <div className="calendar-title-group">
          <h4><CalendarIcon size={18} color="#38bdf8" /> Pet Care Calendar & Reminders</h4>
          <p className="calendar-subtitle">Vet visits, grooming, walking & routine tasks synced with co-parents</p>
        </div>
        <div className="calendar-actions-row">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Reminder
          </button>
        </div>
      </div>

      {!currentPetId && (
        <PetLegendBar
          pets={pets}
          selectedFilterPetId={selectedPetFilter}
          onSelectPetFilter={setSelectedPetFilter}
          getPetColor={getPetColor}
        />
      )}

      <div className="calendar-main-grid-layout">
        <MonthCalendarGrid
          currentDate={currentDate}
          onPrevMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          onNextMonth={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          appointments={filteredAppts}
          reminders={filteredReminders}
        />

        <RemindersAgendaList
          selectedDate={selectedDate}
          appointments={filteredAppts}
          reminders={filteredReminders}
          onToggleReminder={handleToggleReminder}
          onDeleteReminder={handleDeleteReminder}
          onCancelAppointment={handleCancelAppointment}
        />
      </div>

      <AddReminderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        pets={pets.length > 0 ? pets : (currentPetId ? [{ _id: currentPetId, name: 'Current Pet', species: 'dog', breed: 'Mixed', age: 2, weight: 10, gender: 'male', knownConditions: [], allergies: [], medications: [], medicalHistory: [] }] : [])}
        onAddReminder={handleAddReminder}
      />
    </div>
  );
};
