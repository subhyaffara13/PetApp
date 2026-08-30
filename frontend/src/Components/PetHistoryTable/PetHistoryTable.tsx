import React from 'react';
import { FileText, Image as ImageIcon, Calendar, Stethoscope } from 'lucide-react';
import type { ViewableRecord } from '../RecordViewerModal/RecordViewerModal';
import './PetHistoryTable.css';

interface PetHistoryTableProps {
  records: any[];
  petName: string;
  onOpenRecord: (record: ViewableRecord) => void;
}

export const PetHistoryTable: React.FC<PetHistoryTableProps> = ({ records, petName, onOpenRecord }) => {
  if (!records || records.length === 0) {
    return (
      <div className="pet-history-table-empty">
        <Stethoscope size={32} color="#64748b" />
        <p>No past medical records logged for {petName} yet.</p>
        <small>Use "📸 Scan Past Record / Receipt" to digitize paper invoices.</small>
      </div>
    );
  }

  return (
    <div className="pet-history-table-container">
      <table className="pet-history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type & Title</th>
            <th>Clinic / Vet</th>
            <th>Summary / Diagnosis</th>
            <th>Cost</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec, idx) => {
            const fileType = rec.fileType || (rec.fileData?.startsWith('data:image') ? 'image' : rec.fileData?.startsWith('data:application/pdf') ? 'pdf' : 'text');

            return (
              <tr key={rec._id || idx} className="history-table-row">
                <td className="cell-date">
                  <Calendar size={12} /> {rec.date || rec.createdAt?.split('T')[0] || '2026-08-28'}
                </td>
                <td className="cell-title">
                  <span className={`event-type-badge type-${rec.type || 'checkup'}`}>{rec.type || 'Visit'}</span>
                  <strong>{rec.title || 'Clinical Consultation'}</strong>
                </td>
                <td className="cell-clinic">
                  <div>{rec.clinicName || 'Veterinary Medical Center'}</div>
                  <small>{rec.vetName || 'Attending Vet'}</small>
                </td>
                <td className="cell-summary">
                  <p>{rec.diagnosis || rec.description || 'Routine care and examination recorded.'}</p>
                </td>
                <td className="cell-cost">
                  {rec.billedTotal || '₪ 180.00'}
                </td>
                <td className="cell-action">
                  <button
                    type="button"
                    className="btn-open-file"
                    onClick={() => onOpenRecord(rec)}
                  >
                    {fileType === 'image' ? <ImageIcon size={13} /> : <FileText size={13} />}
                    <span>Open File</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
