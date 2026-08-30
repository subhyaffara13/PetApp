import { useState, useEffect } from 'react';
import axios from 'axios';
import type { MedicalEvent } from '../../schemas';
import {
  Stethoscope,
  Pill,
  ClipboardList,
  FileBadge,
  Download,
  Calendar,
  Syringe,
  Camera,
} from 'lucide-react';
import { DocumentUploadModal } from '../DocumentUploadModal/DocumentUploadModal';
import { PetHistoryTable } from '../PetHistoryTable/PetHistoryTable';
import { RecordViewerModal } from '../RecordViewerModal/RecordViewerModal';
import type { ViewableRecord } from '../RecordViewerModal/RecordViewerModal';
import { PetSpendingAnalytics } from '../PetSpendingAnalytics/PetSpendingAnalytics';
import { Table, ListFilter, PieChart } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './MedicalTimeline.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ClinicalRecord {
  _id: string;
  petId: string;
  petName: string;
  clinicId: string;
  clinicName: string;
  veterinarianName: string;
  visitDate: string;
  visitType: string;
  chiefComplaint: string;
  diagnosis: string;
  treatmentAdministered: string;
  prescriptions: Array<{ medicationName: string; dosage: string; frequency: string; duration: string; notes?: string }>;
  vaccinations: Array<{ vaccineName: string; batchNumber?: string; administeredDate: string; nextDueDate: string }>;
  dischargeInstructions: string;
  billedTotal?: string;
  fileType?: 'pdf' | 'image' | 'text';
  fileData?: string;
}

interface MedicalTimelineProps {
  events: MedicalEvent[];
  petId?: string;
  petName?: string;
  onRefresh?: () => void;
}

export const MedicalTimeline = ({ events, petId, petName, onRefresh }: MedicalTimelineProps) => {
  const { t } = useTranslation();
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'clinical' | 'owner_events' | 'spending'>('clinical');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [selectedRecord, setSelectedRecord] = useState<ViewableRecord | null>(null);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);

  const fetchClinicalRecords = async () => {
    try {
      const url = petId
        ? `${API_URL}/clinic/records/pet/${petId}`
        : `${API_URL}/clinic/records/all`;
      const res = await axios.get(url);
      const matched = res.data.filter(
        (r: any) => !petName || r.petName.toLowerCase() === petName.toLowerCase() || r.petId === petId
      );
      setClinicalRecords(matched.length > 0 ? matched : res.data);
    } catch (e) {
      console.error('Failed to fetch clinical records', e);
    }
  };

  useEffect(() => {
    fetchClinicalRecords();
  }, [petId, petName]);

  const handleExportPassport = () => {
    window.print();
  };

  return (
    <div className="medical-timeline-container" id="medical-timeline">
      {/* Sub tabs & Export Passport Button */}
      <div className="timeline-top-bar">
        <div className="timeline-tabs">
          <button
            className={`timeline-tab-btn ${activeSubTab === 'clinical' ? 'timeline-tab-btn--active' : ''}`}
            onClick={() => setActiveSubTab('clinical')}
          >
            <FileBadge size={16} /> {t('profile.tab_vet_records', 'Vet Verified Records')} ({clinicalRecords.length})
          </button>
          <button
            className={`timeline-tab-btn ${activeSubTab === 'owner_events' ? 'timeline-tab-btn--active' : ''}`}
            onClick={() => setActiveSubTab('owner_events')}
          >
            <ClipboardList size={16} /> {t('profile.tab_home_log', 'Home Log')} ({events.length})
          </button>
          <button
            className={`timeline-tab-btn ${activeSubTab === 'spending' ? 'timeline-tab-btn--active' : ''}`}
            onClick={() => setActiveSubTab('spending')}
          >
            <PieChart size={16} /> 📊 {t('profile.tab_spending', 'Spending Breakdown')}
          </button>
          {activeSubTab !== 'spending' && (
            <button
              className={`timeline-tab-btn ${viewMode === 'table' ? 'timeline-tab-btn--active' : ''}`}
              onClick={() => setViewMode(viewMode === 'timeline' ? 'table' : 'timeline')}
              title="Switch between Visual Timeline and Tabular Summary"
            >
              {viewMode === 'timeline' ? <Table size={15} /> : <ListFilter size={15} />}
              {viewMode === 'timeline' ? 'Table View' : 'Timeline View'}
            </button>
          )}
        </div>

        <div className="timeline-top-actions">
          <button
            className="btn-scan-record-passport"
            onClick={() => setShowDocUploadModal(true)}
            title="Scan past paper record or PDF receipt"
          >
            <Camera size={14} /> {t('profile.btn_scan_record', 'Scan Past Record / Receipt')}
          </button>
          <button className="btn-export-passport" onClick={handleExportPassport} title="Print or Save Medical Passport">
            <Download size={14} /> {t('profile.btn_export_pdf', 'Export Health Passport')}
          </button>
        </div>
      </div>

      <DocumentUploadModal
        isOpen={showDocUploadModal}
        onClose={() => setShowDocUploadModal(false)}
        petId={petId || ''}
        petName={petName || 'Pet'}
        onRecordAdded={() => {
          fetchClinicalRecords();
          onRefresh?.();
        }}
      />

      {selectedRecord && (
        <RecordViewerModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {/* SPENDING ANALYTICS MODE */}
      {activeSubTab === 'spending' ? (
        <PetSpendingAnalytics
          petName={petName || 'Pet'}
          medicalRecords={clinicalRecords}
          onOpenReceiptScanner={() => setShowDocUploadModal(true)}
        />
      ) : viewMode === 'table' ? (
        <PetHistoryTable
          records={activeSubTab === 'clinical' ? clinicalRecords : events}
          petName={petName || 'Pet'}
          onOpenRecord={(rec) => setSelectedRecord(rec)}
        />
      ) : (
        <>
          {activeSubTab === 'clinical' && (
        <div className="clinical-records-list">
          {clinicalRecords.length === 0 ? (
            <div className="timeline-empty">
              <FileBadge size={32} />
              <p>No verified clinic records yet</p>
              <span>When a vet treats {petName || 'your pet'} and publishes a visit record, it will appear here automatically.</span>
            </div>
          ) : (
            clinicalRecords.map((r, i) => (
              <div key={r._id || i} className="clinical-record-card card animate-fade-in">
                <div className="clinical-card-header">
                  <div>
                    <div className="clinical-badge-row">
                      <span className={`clinic-badge-type clinic-badge-type--${r.visitType}`}>
                        {r.visitType.toUpperCase()}
                      </span>
                      <span className="clinic-visit-date">
                        <Calendar size={13} /> {new Date(r.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="clinic-record-title">{r.diagnosis}</h4>
                  </div>
                  <div className="clinic-source-badge">
                    <strong>{r.clinicName}</strong>
                    <span>{r.veterinarianName}</span>
                  </div>
                </div>

                <div className="clinical-card-body">
                  <div className="clinical-detail-row">
                    <span className="detail-label">Chief Complaint:</span>
                    <p>{r.chiefComplaint}</p>
                  </div>

                  {r.treatmentAdministered && (
                    <div className="clinical-detail-row">
                      <span className="detail-label">Treatment & Care:</span>
                      <p>{r.treatmentAdministered}</p>
                    </div>
                  )}

                  {r.prescriptions && r.prescriptions.length > 0 && (
                    <div className="clinical-detail-row">
                      <span className="detail-label">Prescriptions:</span>
                      <div className="passport-rx-list">
                        {r.prescriptions.map((rx, rxIdx) => (
                          <div key={rxIdx} className="passport-rx-item">
                            <Pill size={14} className="rx-icon" />
                            <strong>{rx.medicationName}</strong> — {rx.dosage} ({rx.frequency} for {rx.duration})
                            {rx.notes && <span className="rx-note-text"> · {rx.notes}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {r.vaccinations && r.vaccinations.length > 0 && (
                    <div className="clinical-detail-row">
                      <span className="detail-label">Vaccines:</span>
                      <div className="passport-vax-list">
                        {r.vaccinations.map((vax, vaxIdx) => (
                          <div key={vaxIdx} className="passport-vax-item">
                            <Syringe size={14} className="vax-icon" />
                            <strong>{vax.vaccineName}</strong> (Batch: {vax.batchNumber || 'N/A'}) · Next booster: {new Date(vax.nextDueDate).toLocaleDateString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {r.dischargeInstructions && (
                    <div className="clinical-discharge-box">
                      <span className="detail-label">Home Instructions:</span>
                      <p>{r.dischargeInstructions}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: OWNER LOGGED TIMELINE */}
      {activeSubTab === 'owner_events' && (
        <div className="medical-timeline">
          {events.length === 0 ? (
            <div className="timeline-empty">
              <ClipboardList size={32} />
              <p>No home health notes logged</p>
              <span>Keep track of weight changes, tick treatments, or minor symptoms here.</span>
            </div>
          ) : (
            events.map((event, i) => (
              <div className="timeline-item animate-fade-in" key={event.id || i}>
                <div className="timeline-item__line" />
                <div className="timeline-item__icon" style={{ background: 'var(--color-primary)' }}>
                  <Stethoscope size={14} color="white" />
                </div>
                <div className="timeline-item__content card">
                  <div className="timeline-item__header">
                    <h4>{event.title}</h4>
                    <time className="timeline-item__date">
                      {new Date(event.date).toLocaleDateString()}
                    </time>
                  </div>
                  {event.description && (
                    <p className="timeline-item__desc">{event.description}</p>
                  )}
                  {event.vetName && (
                    <span className="timeline-item__vet">Dr. {event.vetName}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
};
