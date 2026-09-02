import React from 'react';
import type { GroomingAppointment } from '../../../schemas';

interface GroomerRecordsTabProps {
  appointments: GroomingAppointment[];
  onEditNote: (appt: GroomingAppointment) => void;
}

export const GroomerRecordsTab: React.FC<GroomerRecordsTabProps> = ({
  appointments,
  onEditNote,
}) => {
  return (
    <div className="groomer-records-tab">
      <h2>Pet Coat & Skin Condition Records</h2>
      <p className="tab-sub">
        Historical grooming observations, skin sensitivities, matting alerts, and styling preferences.
      </p>

      <div className="records-table-card">
        <table className="records-table">
          <thead>
            <tr>
              <th>Pet Name</th>
              <th>Breed</th>
              <th>Parent</th>
              <th>Date</th>
              <th>Coat Notes & Skin Observations</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td><strong>🐾 {a.petName}</strong></td>
                <td>{a.petBreed}</td>
                <td>{a.customerName}</td>
                <td>{a.appointmentDate || '2026-09-02'}</td>
                <td>
                  {a.coatConditionNotes ? (
                    <span className="notes-text">{a.coatConditionNotes}</span>
                  ) : (
                    <span className="notes-empty">No notes recorded yet</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-edit-note"
                    onClick={() => onEditNote(a)}
                  >
                    Edit Note
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
