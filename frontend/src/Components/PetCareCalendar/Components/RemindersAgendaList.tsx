import React from 'react';
import { CheckCircle, Circle, Clock, Stethoscope, Scissors, Dog, Home, Trash2 } from 'lucide-react';
import type { Appointment, Reminder } from '../../../schemas';

interface RemindersAgendaListProps {
  selectedDate: string;
  appointments: Appointment[];
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onCancelAppointment: (id: string) => void;
}

export const RemindersAgendaList: React.FC<RemindersAgendaListProps> = ({
  selectedDate,
  appointments,
  reminders,
  onToggleReminder,
  onDeleteReminder,
  onCancelAppointment,
}) => {
  const dayAppts = appointments.filter((a) => !selectedDate || a.appointmentDate === selectedDate);
  const dayReminders = reminders.filter((r) => !selectedDate || r.dueDate === selectedDate);

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'groomer': return <Scissors size={14} color="#ec4899" />;
      case 'dog_walker': return <Dog size={14} color="#10b981" />;
      case 'pet_sitter': return <Home size={14} color="#8b5cf6" />;
      default: return <Stethoscope size={14} color="#0ea5e9" />;
    }
  };

  return (
    <div className="agenda-list-wrapper">
      <div className="agenda-header-row">
        <h5>{selectedDate ? `Agenda for ${selectedDate}` : 'Upcoming Care Schedule'}</h5>
        <span className="agenda-count-pill">{dayAppts.length + dayReminders.length} items</span>
      </div>

      {dayAppts.length === 0 && dayReminders.length === 0 ? (
        <div className="agenda-empty-card">
          <p>No booked visits or routine reminders for this date.</p>
        </div>
      ) : (
        <div className="agenda-items-container">
          {/* Confirmed Appointments */}
          {dayAppts.map((appt) => (
            <div key={appt._id} className="agenda-item-card appt-item" style={{ borderLeftColor: appt.petColor || '#f97316' }}>
              <div className="item-badge-type">
                {getProviderIcon(appt.providerType)}
                <span>{appt.providerType === 'veterinarian' || appt.providerType === 'clinic' ? 'Vet Visit' : appt.providerType}</span>
              </div>
              <div className="item-details">
                <div className="item-title-row">
                  <strong className="item-title">{appt.serviceName}</strong>
                  <span className="item-time"><Clock size={12} /> {appt.timeSlot}</span>
                </div>
                <p className="item-meta">
                  🐾 <strong>{appt.petName}</strong> with {appt.providerName}
                </p>
                {appt.notes && <p className="item-notes">"{appt.notes}"</p>}
              </div>
              <button
                type="button"
                className="btn-item-cancel"
                onClick={() => appt._id && onCancelAppointment(appt._id)}
                title="Cancel Visit"
              >
                Cancel
              </button>
            </div>
          ))}

          {/* Routine & Custom Reminders */}
          {dayReminders.map((rem) => (
            <div
              key={rem._id}
              className={`agenda-item-card reminder-item ${rem.isCompleted ? 'completed' : ''}`}
              style={{ borderLeftColor: rem.petColor || '#38bdf8' }}
            >
              <button
                type="button"
                className="btn-toggle-check"
                onClick={() => rem._id && onToggleReminder(rem._id)}
              >
                {rem.isCompleted ? <CheckCircle size={18} color="#10b981" /> : <Circle size={18} color="#94a3b8" />}
              </button>

              <div className="item-details">
                <div className="item-title-row">
                  <strong className={`item-title ${rem.isCompleted ? 'strike' : ''}`}>{rem.title}</strong>
                  {rem.dueTime && <span className="item-time"><Clock size={12} /> {rem.dueTime}</span>}
                </div>
                <p className="item-meta">
                  🐾 <strong>{rem.petName}</strong> · {rem.type} {rem.recurrence !== 'once' ? `(${rem.recurrence})` : ''}
                </p>
              </div>

              <button
                type="button"
                className="btn-item-delete"
                onClick={() => rem._id && onDeleteReminder(rem._id)}
                title="Delete reminder"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
