import { useState, useEffect } from 'react';
import axios from 'axios';
import type { MedicalEvent } from '../../schemas';
import { FileBadge, Download, ClipboardList, PieChart, Camera } from 'lucide-react';
import { DocumentUploadModal } from '../DocumentUploadModal/DocumentUploadModal';
import { RecordViewerModal, type ViewableRecord } from '../RecordViewerModal/RecordViewerModal';
import { PetSpendingAnalytics } from '../PetSpendingAnalytics/PetSpendingAnalytics';
import { ClinicalRecordsTimelineList } from './Components/ClinicalRecordsTimelineList';
import { HomeLogTimelineList } from './Components/HomeLogTimelineList';
import { useTranslation } from '../../context/LanguageContext';
import { API_URL } from '../../config/api';
import './MedicalTimeline.css';

interface MedicalTimelineProps {
  events: MedicalEvent[];
  petId?: string;
  petName?: string;
  onRefresh?: () => void;
}

export const MedicalTimeline = ({ events, petId, petName, onRefresh }: MedicalTimelineProps) => {
  const { t } = useTranslation();
  const [clinicalRecords, setClinicalRecords] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'clinical' | 'owner_events' | 'spending'>('clinical');
  const [selectedRecord, setSelectedRecord] = useState<ViewableRecord | null>(null);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);

  const fetchClinicalRecords = async () => {
    try {
      const url = petId ? `${API_URL}/clinic/records/pet/${petId}` : `${API_URL}/clinic/records/all`;
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

  return (
    <div className="medical-timeline-container" id="medical-timeline">
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
            <PieChart size={16} /> {t('profile.tab_spending', 'Spending Breakdown')}
          </button>
        </div>

        <div className="timeline-action-buttons">
          <button className="btn btn-secondary btn-sm" onClick={() => setShowDocUploadModal(true)}>
            <Camera size={14} /> {t('profile.btn_scan_record', 'Scan Past Record / Receipt')}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
            <Download size={14} /> {t('profile.btn_export_pdf', 'Export Health Passport')}
          </button>
        </div>
      </div>

      {activeSubTab === 'spending' ? (
        <PetSpendingAnalytics
          petName={petName || 'Pet'}
          medicalRecords={[...clinicalRecords, ...events]}
          onOpenReceiptScanner={() => setShowDocUploadModal(true)}
        />
      ) : activeSubTab === 'clinical' ? (
        <ClinicalRecordsTimelineList
          clinicalRecords={clinicalRecords}
          onSelectRecord={(r: any) => setSelectedRecord(r)}
          onOpenUpload={() => setShowDocUploadModal(true)}
        />
      ) : (
        <HomeLogTimelineList events={events} />
      )}

      {selectedRecord && (
        <RecordViewerModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
      {showDocUploadModal && petId && (
        <DocumentUploadModal
          isOpen={showDocUploadModal}
          onClose={() => setShowDocUploadModal(false)}
          petId={petId}
          petName={petName || 'Pet'}
          onRecordAdded={() => { fetchClinicalRecords(); onRefresh?.(); }}
        />
      )}
    </div>
  );
};
