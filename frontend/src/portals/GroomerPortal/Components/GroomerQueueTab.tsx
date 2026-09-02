import React from 'react';
import type { GroomingAppointment } from '../../../schemas';
import { User, Clock, Phone, FileText } from 'lucide-react';

interface GroomerQueueTabProps {
  appointments: GroomingAppointment[];
  onStatusChange: (id: string, newStatus: string) => void;
  onEditNotes: (appt: GroomingAppointment) => void;
  onIssueInvoice: (id: string) => void;
}

const statusColumns = [
  { key: 'confirmed', title: '📋 Booked & Confirmed' },
  { key: 'in_tub', title: '🛁 In Hydro-Bath' },
  { key: 'styling', title: '✂️ Precision Styling' },
  { key: 'ready', title: '🎀 Ready for Pickup' },
  { key: 'completed', title: '✓ Completed & Invoiced' },
];

export const GroomerQueueTab: React.FC<GroomerQueueTabProps> = ({
  appointments,
  onStatusChange,
  onEditNotes,
  onIssueInvoice,
}) => {
  return (
    <div className="groomer-queue-container">
      <div className="queue-columns-grid">
        {statusColumns.map(({ key, title }) => {
          const columnAppts = appointments.filter((a) => (a.status || 'confirmed') === key);

          return (
            <div key={key} className="queue-column-card">
              <div className="queue-column-header">
                <h3>{title}</h3>
                <span className="queue-col-count">{columnAppts.length}</span>
              </div>

              <div className="queue-cards-list">
                {columnAppts.map((appt) => (
                  <div key={appt._id} className="groom-appt-card">
                    <div className="appt-card-top">
                      <div>
                        <div className="appt-pet-title">🐾 {appt.petName}</div>
                        <span className="appt-breed-tag">{appt.petBreed || 'Standard Breed'}</span>
                      </div>
                      <span className="appt-price-tag">₪{appt.totalPrice}</span>
                    </div>

                    <div className="appt-customer-meta">
                      <div className="meta-line">
                        <User size={13} /> <span>{appt.customerName}</span>
                      </div>
                      <div className="meta-line">
                        <Clock size={13} /> <span>{appt.timeSlot || '10:00 AM'}</span>
                      </div>
                      {appt.customerPhone && (
                        <div className="meta-line">
                          <Phone size={13} /> <span>{appt.customerPhone}</span>
                        </div>
                      )}
                    </div>

                    {appt.services && appt.services.length > 0 && (
                      <div className="appt-services-tags">
                        {appt.services.map((s, idx) => (
                          <span key={idx} className="appt-service-pill">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {appt.coatConditionNotes && (
                      <div className="appt-notes-preview">
                        📝 {appt.coatConditionNotes}
                      </div>
                    )}

                    <div className="appt-card-footer">
                      <select
                        className="status-dropdown"
                        value={appt.status}
                        onChange={(e) => onStatusChange(appt._id!, e.target.value)}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="in_tub">In Hydro-Bath</option>
                        <option value="styling">Styling & Cut</option>
                        <option value="ready">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                      </select>

                      <button
                        type="button"
                        className="btn-action-icon"
                        title="Coat & Skin Notes"
                        onClick={() => onEditNotes(appt)}
                      >
                        <FileText size={14} />
                      </button>

                      <button
                        type="button"
                        className="btn-action-invoice"
                        title="Generate Itemized Tax Receipt"
                        onClick={() => onIssueInvoice(appt._id!)}
                      >
                        🧾 Invoice
                      </button>
                    </div>
                  </div>
                ))}

                {columnAppts.length === 0 && (
                  <div className="column-empty-placeholder">No pets in this stage</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
