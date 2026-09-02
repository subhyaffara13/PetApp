import React from 'react';
import type { MedicalEvent } from '../../../schemas';
import { Calendar, Syringe, Pill, Stethoscope, ClipboardList } from 'lucide-react';

interface HomeLogTimelineListProps {
  events: MedicalEvent[];
}

export const HomeLogTimelineList: React.FC<HomeLogTimelineListProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="timeline-empty-card">
        <ClipboardList size={36} color="var(--color-text-muted)" />
        <p>No home health observations logged yet.</p>
      </div>
    );
  }

  return (
    <div className="medical-timeline-list">
      {events.map((ev) => (
        <div key={ev._id} className="timeline-item">
          <div className={`timeline-item__icon timeline-item__icon--${ev.type}`}>
            {ev.type === 'vaccine' && <Syringe size={18} />}
            {ev.type === 'medication' && <Pill size={18} />}
            {ev.type === 'visit' && <Stethoscope size={18} />}
            {ev.type === 'note' && <ClipboardList size={18} />}
          </div>
          <div className="timeline-item__content">
            <div className="timeline-item__header">
              <span className="timeline-item__title">{ev.title}</span>
              <span className="timeline-item__date">
                <Calendar size={12} /> {ev.date}
              </span>
            </div>
            {ev.clinic && <p className="timeline-item__clinic">📍 {ev.clinic}</p>}
            {ev.description && <p className="timeline-item__desc">{ev.description}</p>}
            {ev.cost && <p className="timeline-item__cost">₪{ev.cost}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
