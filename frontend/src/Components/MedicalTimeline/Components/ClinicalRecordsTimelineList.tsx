import React from 'react';
import { Calendar, Syringe, Pill, Stethoscope } from 'lucide-react';

interface ClinicalRecordsTimelineListProps {
  clinicalRecords: any[];
  onSelectRecord: (record: any) => void;
  onOpenUpload: () => void;
}

export const ClinicalRecordsTimelineList: React.FC<ClinicalRecordsTimelineListProps> = ({
  clinicalRecords,
  onSelectRecord,
  onOpenUpload,
}) => {
  if (clinicalRecords.length === 0) {
    return (
      <div className="timeline-empty-card">
        <Stethoscope size={36} color="var(--color-text-muted)" />
        <p>No verified clinic records on file yet.</p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenUpload}
        >
          Scan Past Paper Record / Receipt
        </button>
      </div>
    );
  }

  return (
    <div className="medical-timeline-list">
      {clinicalRecords.map((r) => (
        <div
          key={r._id}
          className="timeline-item clinical-timeline-item"
          onClick={() => onSelectRecord(r)}
        >
          <div className="timeline-item__icon timeline-item__icon--clinical">
            <Stethoscope size={18} />
          </div>
          <div className="timeline-item__content">
            <div className="timeline-item__header">
              <span className="timeline-item__title">{r.diagnosis || r.chiefComplaint || 'Clinical Consultation'}</span>
              <span className="timeline-item__date">
                <Calendar size={12} /> {r.visitDate}
              </span>
            </div>
            <p className="timeline-item__clinic">
              🏥 {r.clinicName} · Dr. {r.veterinarianName}
            </p>
            {r.treatmentAdministered && (
              <p className="timeline-item__desc">{r.treatmentAdministered}</p>
            )}
            <div className="timeline-item__chips">
              {r.prescriptions?.map((rx: any, idx: number) => (
                <span key={idx} className="timeline-chip timeline-chip--rx">
                  <Pill size={11} /> {rx.medicationName}
                </span>
              ))}
              {r.vaccinations?.map((vx: any, idx: number) => (
                <span key={idx} className="timeline-chip timeline-chip--vx">
                  <Syringe size={11} /> {vx.vaccineName}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
