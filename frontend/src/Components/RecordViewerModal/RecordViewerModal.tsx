import React from 'react';
import { FileText, Image as ImageIcon, X } from 'lucide-react';
import './RecordViewerModal.css';

export interface ViewableRecord {
  title: string;
  date: string;
  clinicName?: string;
  vetName?: string;
  diagnosis?: string;
  description?: string;
  treatments?: string[];
  prescriptions?: Array<{ medicationName: string; dosage?: string; frequency?: string }>;
  vaccinations?: Array<{ vaccineName: string; batchNumber?: string; nextDueDate?: string }>;
  billedTotal?: string;
  invoiceNumber?: string;
  fileType?: 'pdf' | 'image' | 'text';
  fileData?: string; // base64 or object URL
  fileName?: string;
}

interface RecordViewerModalProps {
  record: ViewableRecord;
  onClose: () => void;
}

export const RecordViewerModal: React.FC<RecordViewerModalProps> = ({ record, onClose }) => {
  const fileType = record.fileType || (record.fileData?.startsWith('data:image') ? 'image' : record.fileData?.startsWith('data:application/pdf') ? 'pdf' : 'text');

  return (
    <div className="record-viewer-overlay" onClick={onClose}>
      <div className="record-viewer-card" onClick={(e) => e.stopPropagation()}>
        <div className="record-viewer-header">
          <div className="record-title-row">
            {fileType === 'pdf' ? <FileText color="#ef4444" size={20} /> : fileType === 'image' ? <ImageIcon color="#3b82f6" size={20} /> : <FileText color="#10b981" size={20} />}
            <div>
              <h3>{record.title || 'Pet Medical File'}</h3>
              <small>{record.date} · {record.clinicName || 'Attending Clinic'}</small>
            </div>
          </div>
          <button className="btn-close-viewer" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="record-viewer-body">
          {fileType === 'image' && record.fileData ? (
            <div className="image-viewer-box">
              <img src={record.fileData} alt={record.title} className="scanned-image-preview" />
            </div>
          ) : fileType === 'pdf' && record.fileData ? (
            <div className="pdf-viewer-box">
              <iframe src={record.fileData} title="PDF Record Preview" className="pdf-iframe-preview" />
            </div>
          ) : (
            <div className="text-emr-viewer-box">
              <div className="emr-summary-banner">
                <div><strong>Invoice / Ref:</strong> {record.invoiceNumber || 'EMR-RECORD'}</div>
                <div><strong>Attending Vet:</strong> {record.vetName || 'Staff Veterinarian'}</div>
                {record.billedTotal && <div><strong>Billed Total:</strong> <span className="cost-tag">{record.billedTotal}</span></div>}
              </div>
              <div className="emr-section">
                <h4>Diagnosis & Summary</h4>
                <p>{record.diagnosis || record.description || 'Clinical examination and treatments logged.'}</p>
              </div>
              {record.treatments && record.treatments.length > 0 && (
                <div className="emr-section">
                  <h4>Treatments Administered</h4>
                  <ul>{record.treatments.map((t, idx) => <li key={idx}>{t}</li>)}</ul>
                </div>
              )}
              {record.prescriptions && record.prescriptions.length > 0 && (
                <div className="emr-section">
                  <h4>Prescriptions Dispensed</h4>
                  <ul>{record.prescriptions.map((p, idx) => <li key={idx}><strong>{p.medicationName}</strong>: {p.dosage || 'As directed'} ({p.frequency || 'Daily'})</li>)}</ul>
                </div>
              )}
              {record.vaccinations && record.vaccinations.length > 0 && (
                <div className="emr-section">
                  <h4>Vaccine Batches</h4>
                  <ul>{record.vaccinations.map((v, idx) => <li key={idx}>💉 {v.vaccineName} (Batch: {v.batchNumber || 'N/A'}, Next Due: {v.nextDueDate || '1 Year'})</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
