import React, { useState, useEffect } from 'react';
import type { GroomingAppointment } from '../../../schemas';

interface CoatNotesModalProps {
  appointment: GroomingAppointment | null;
  onClose: () => void;
  onSave: (notes: string) => void;
}

export const CoatNotesModal: React.FC<CoatNotesModalProps> = ({
  appointment,
  onClose,
  onSave,
}) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (appointment) {
      setNotes(appointment.coatConditionNotes || '');
    }
  }, [appointment]);

  if (!appointment) return null;

  return (
    <div className="portal-modal-backdrop" onClick={onClose}>
      <div className="portal-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Coat & Skin Condition Notes</h3>
        <p className="modal-sub">
          Recording clinical grooming notes for <strong>{appointment.petName}</strong> ({appointment.petBreed})
        </p>

        <textarea
          className="notes-textarea"
          rows={4}
          placeholder="e.g. Mild dry skin on lower back, sensitive left ear, owner requested rounded puppy cut..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="portal-modal-actions">
          <button type="button" className="btn-submit-portal" onClick={() => onSave(notes)}>
            Save Notes
          </button>
          <button type="button" className="btn-cancel-portal" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
