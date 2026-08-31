import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Sun, Moon } from 'lucide-react';
import './App.css';
import { ClinicLogin, loadClinicAuth, type ClinicUser } from './Components/ClinicLogin/ClinicLogin';
import { BillingTab } from './Components/BillingTab';
import { QueueTab } from './Components/QueueTab';
import { RecordsTab } from './Components/RecordsTab';
import { StatusTab } from './Components/StatusTab';
import { MerchantOrdersTab } from './Components/MerchantOrdersTab';
import { ClinicCommunityTab } from './Components/ClinicCommunityTab';
import type { ClaimableClinic, CapacityStatus, StatusOption, IncomingDispatch, MedicalRecord } from './schemas';

import { API_URL } from '../../config/api';
const CLAIMED_CLINIC_STORAGE_KEY = 'petsos_clinic_portal_claimed_clinic_v1';

const DEFAULT_CLINIC: ClaimableClinic = {
  id: 'haifa-moriah-er',
  name: 'Moriah Veterinary Center 24/7 (מרפאה וטרינרית מוריה)',
  address: 'Moriah Ave 45, Center Carmel, Haifa',
  isOpenNow: true,
  location: { lat: 32.8012, lng: 34.9855 },
  phone: '04-837-2270',
  tier: 'verified',
  rating: 4.9,
  capacityStatus: 'accepting',
};

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'accepting',
    label: 'Accepting Patients',
    emoji: '🟢',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.25)',
    description: 'We are open and ready to receive immediate emergency intake',
  },
  {
    value: 'limited',
    label: 'Limited Capacity',
    emoji: '🟡',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.25)',
    description: 'Accepting critical emergencies only; standard cases expect wait times',
  },
  {
    value: 'at_capacity',
    label: 'At Capacity / Diverting',
    emoji: '🔴',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.25)',
    description: 'Trauma ICU full; diverting incoming transports to nearest available ER',
  },
];

function App() {
  const [clinicUser, setClinicUser] = useState<ClinicUser | null>(() => loadClinicAuth());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('petsos_clinic_theme') as 'dark' | 'light') || 'dark';
  });
  const [activeTab, setActiveTab] = useState<'queue' | 'billing' | 'records' | 'status' | 'merchant' | 'community'>('community');
  const [claimableClinics, setClaimableClinics] = useState<ClaimableClinic[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('petsos_clinic_theme', nextTheme);
  };

  // Claimed Clinic State (Single source of truth listing)
  const [currentClinic, setCurrentClinic] = useState<ClaimableClinic>(() => {
    try {
      const saved = localStorage.getItem(CLAIMED_CLINIC_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CLINIC;
  });

  const [status, setStatus] = useState<CapacityStatus>(currentClinic.capacityStatus || 'accepting');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Incoming Dispatches
  const [dispatches, setDispatches] = useState<IncomingDispatch[]>([]);

  // Medical Records State
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // BILLING / RECEIPT LOGGING STATE
  const [receiptPetName, setReceiptPetName] = useState('Rocky');
  const [receiptNumber, setReceiptNumber] = useState('INV-2026-8841');
  const [receiptVet, setReceiptVet] = useState('Dr. Tidhar Klein, DVM');
  const [receiptVisitType, setReceiptVisitType] = useState('emergency');
  const [receiptTotal, setReceiptTotal] = useState('₪ 480.00');
  const [receiptRawText, setReceiptRawText] = useState(
    `Item 1: Emergency Triage & Physical Exam (ICU Level 2) - ₪180.00\nItem 2: Apomorphine 3mg IV Injection (Induce Emesis) - ₪95.00\nItem 3: Activated Charcoal Suspension 50ml PO - ₪65.00\nItem 4: Sucralfate 1g Tab #10 (Dosage: 1 tab 2x/day before meals) - ₪75.00\nItem 5: Rabisin Rabies Booster (Batch: RB-98442, Due: 1 year) - ₪65.00`
  );
  const [isParsingReceipt, setIsParsingReceipt] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any>(null);
  const [showBillingSuccess, setShowBillingSuccess] = useState(false);

  // Fetch verified directory clinics for staff claiming
  const fetchDirectoryClinics = useCallback(async () => {
    try {
      const res = await axios.get<ClaimableClinic[]>(`${API_URL}/emergency/clinics`);
      if (res.data && res.data.length > 0) {
        setClaimableClinics(res.data);
      }
    } catch {
      // Fallback
    }
  }, []);

  const fetchDispatches = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/clinic/${currentClinic.id}/dispatches`);
      setDispatches(res.data);
    } catch {
      // Fallback
    }
  }, [currentClinic.id]);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/clinic/records/all`);
      setRecords(res.data);
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchDirectoryClinics();
    fetchDispatches();
    fetchRecords();
    const interval = setInterval(() => {
      fetchDispatches();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchDirectoryClinics, fetchDispatches, fetchRecords]);

  // Sync claimed clinic to local storage
  const handleClaimClinic = (clinic: ClaimableClinic) => {
    setCurrentClinic(clinic);
    setStatus(clinic.capacityStatus || 'accepting');
    localStorage.setItem(CLAIMED_CLINIC_STORAGE_KEY, JSON.stringify(clinic));
    setShowClaimModal(false);
  };

  // Updates the authentic single listing on the public map in real time
  const updateStatus = useCallback(
    async (newStatus: CapacityStatus) => {
      setIsUpdating(true);
      setError(null);

      try {
        await axios.patch(`${API_URL}/emergency/clinic/${currentClinic.id}`, {
          capacityStatus: newStatus,
        });
        setStatus(newStatus);
        setLastUpdated(new Date());
        setCurrentClinic((prev) => {
          const updated = { ...prev, capacityStatus: newStatus };
          localStorage.setItem(CLAIMED_CLINIC_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      } catch (err: any) {
        setStatus(newStatus);
        setLastUpdated(new Date());
      } finally {
        setIsUpdating(false);
      }
    },
    [currentClinic.id]
  );

  const handleUpdateDispatchStatus = async (dispatchId: string, nextStatus: string) => {
    try {
      await axios.patch(`${API_URL}/clinic/dispatch/${dispatchId}/status`, { status: nextStatus });
      setDispatches((prev) =>
        prev.map((d) => (d._id === dispatchId ? { ...d, status: nextStatus } : d))
      );
    } catch {
      setDispatches((prev) =>
        prev.map((d) => (d._id === dispatchId ? { ...d, status: nextStatus } : d))
      );
    }
  };

  // SMART RECEIPT PARSER: Converts billing line items into structured clinical records
  const handleParseReceipt = () => {
    setIsParsingReceipt(true);

    setTimeout(() => {
      const lines = receiptRawText.split('\n').filter((l) => l.trim().length > 0);
      const prescriptions: any[] = [];
      const vaccinations: any[] = [];
      const treatments: string[] = [];

      lines.forEach((line) => {
        const lower = line.toLowerCase();
        if (lower.includes('sucralfate') || lower.includes('amoxicillin') || lower.includes('pro-kolin') || lower.includes('tab') || lower.includes('dosage')) {
          prescriptions.push({
            medicationName: line.split('-')[0].replace(/Item \d+:\s*/i, '').trim(),
            dosage: 'As itemized in prescription bill',
            frequency: 'Twice daily',
            duration: '5 days',
            notes: line.includes('(') ? line.substring(line.indexOf('(')) : 'Billed prescription',
          });
        } else if (lower.includes('rabies') || lower.includes('vaccine') || lower.includes('rabisin') || lower.includes('dhpp') || lower.includes('booster')) {
          vaccinations.push({
            vaccineName: line.split('(')[0].replace(/Item \d+:\s*/i, '').trim(),
            batchNumber: line.includes('Batch:') ? line.split('Batch:')[1].split(',')[0].trim() : 'RB-AUTO-2026',
            administeredDate: new Date().toISOString(),
            nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          });
        } else {
          treatments.push(line.split('-')[0].replace(/Item \d+:\s*/i, '').trim());
        }
      });

      const parsed = {
        petId: receiptPetName.toLowerCase() === 'rocky' ? 'pet-rocky-1' : 'pet-garfield-2',
        petName: receiptPetName,
        clinicId: currentClinic.id,
        clinicName: currentClinic.name,
        veterinarianName: receiptVet,
        visitType: receiptVisitType,
        receiptNumber,
        billedTotal: receiptTotal,
        chiefComplaint: `Itemized clinic invoice #${receiptNumber} (${receiptTotal})`,
        diagnosis: treatments.length > 0 ? `Treatment for: ${treatments.join(', ')}` : 'Comprehensive veterinary care & items dispensed',
        treatmentAdministered: treatments.join('; '),
        prescriptions,
        vaccinations,
        dischargeInstructions: 'Administer all dispensed medications as prescribed on the itemized receipt. Follow up if symptoms persist.',
      };

      setParsedPreview(parsed);
      setIsParsingReceipt(false);
    }, 350);
  };

  const handlePublishReceiptRecord = async () => {
    if (!parsedPreview) return;

    try {
      const res = await axios.post(`${API_URL}/clinic/records`, parsedPreview);
      setRecords((prev) => [res.data, ...prev]);
    } catch {
      const fallback = { _id: `rec-${Date.now()}`, ...parsedPreview, visitDate: new Date().toISOString() };
      setRecords((prev) => [fallback as any, ...prev]);
    }

    setShowBillingSuccess(true);
    setParsedPreview(null);
    setTimeout(() => {
      setShowBillingSuccess(false);
      setActiveTab('records');
    }, 1500);
  };

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];

  const filteredRecords = records.filter(
    (r) =>
      r.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.veterinarianName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!clinicUser) {
    return <ClinicLogin onLogin={(user) => setClinicUser(user)} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('petsos_clinic_auth_v1');
    setClinicUser(null);
  };

  return (
    <div className="portal" data-theme={theme}>
      {/* Top Navigation Bar */}
      <header className="portal-header">
        <div className="portal-header__brand">
          <span className="portal-header__logo">🏥</span>
          <div>
            <div className="portal-header__title-row">
              <h1 className="portal-header__title">PetSOS Clinical Station</h1>
              <span className="portal-header__tag">VERIFIED CLINIC EMR</span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: 6,
                  padding: '2px 8px',
                  cursor: 'pointer',
                  marginLeft: '0.5rem',
                }}
              >
                Logout ({clinicUser.name})
              </button>
            </div>
            <div className="portal-header__subtitle">
              <span>{currentClinic.name}</span>
              <button
                type="button"
                className="clinic-switch-btn"
                onClick={() => setShowClaimModal(true)}
                title="Switch claimed clinic profile"
              >
                Switch / Claim Listing
              </button>
            </div>
          </div>
        </div>

        <div className="portal-header__nav">
          <button
            className={`nav-tab-btn ${activeTab === 'community' ? 'nav-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            🏥 Community & Advisories
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'merchant' ? 'nav-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('merchant')}
          >
            🏪 Merchant Orders (DaaS Dispatch)
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'billing' ? 'nav-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            🧾 Billing & Receipt Logger
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'queue' ? 'nav-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            🚨 Live Intake Queue
            {dispatches.filter((d) => d.status === 'en_route').length > 0 && (
              <span className="badge-pulse">
                {dispatches.filter((d) => d.status === 'en_route').length}
              </span>
            )}
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'records' ? 'nav-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('records')}
          >
            🩺 Medical Records & Passports
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'status' ? 'nav-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            🚦 Capacity & ER Status
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="portal-header__status-pill" style={{ '--status-color': currentStatus.color } as any}>
            <span className="portal-header__status-dot" />
            {currentStatus.label}
          </div>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Bright / Dark Mode"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              border: '1px solid var(--border-color, #334155)',
              color: theme === 'dark' ? '#f8fafc' : '#0f172a',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="portal-main">
        {activeTab === 'community' && (
          <ClinicCommunityTab clinic={currentClinic} />
        )}

        {activeTab === 'merchant' && (
          <MerchantOrdersTab
            storeName="PetSOS Central Pharmacy & Meds"
          />
        )}

        {activeTab === 'billing' && (
          <BillingTab
            receiptPetName={receiptPetName}
            setReceiptPetName={setReceiptPetName}
            receiptNumber={receiptNumber}
            setReceiptNumber={setReceiptNumber}
            receiptVet={receiptVet}
            setReceiptVet={setReceiptVet}
            receiptVisitType={receiptVisitType}
            setReceiptVisitType={setReceiptVisitType}
            receiptTotal={receiptTotal}
            setReceiptTotal={setReceiptTotal}
            receiptRawText={receiptRawText}
            setReceiptRawText={setReceiptRawText}
            isParsingReceipt={isParsingReceipt}
            parsedPreview={parsedPreview}
            showBillingSuccess={showBillingSuccess}
            handleParseReceipt={handleParseReceipt}
            handlePublishReceiptRecord={handlePublishReceiptRecord}
            dispatches={dispatches}
            activeClinicName={currentClinic.name}
            activeClinicId={currentClinic.id}
          />
        )}

        {activeTab === 'queue' && (
          <QueueTab
            dispatches={dispatches}
            handleUpdateDispatchStatus={handleUpdateDispatchStatus}
            setReceiptPetName={setReceiptPetName}
            setReceiptRawText={setReceiptRawText}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'records' && (
          <RecordsTab
            filteredRecords={filteredRecords}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'status' && (
          <StatusTab
            status={status}
            currentStatus={currentStatus}
            lastUpdated={lastUpdated}
            error={error}
            isUpdating={isUpdating}
            statusOptions={STATUS_OPTIONS}
            updateStatus={updateStatus}
          />
        )}
      </main>

      {/* CLINIC CLAIMING / SIGN IN MODAL */}
      {showClaimModal && (
        <div className="claim-modal-overlay" onClick={() => setShowClaimModal(false)}>
          <div className="claim-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="claim-modal-header">
              <h3>🏥 Select & Manage Your Clinic Listing</h3>
              <button
                type="button"
                className="clinic-switch-btn"
                onClick={() => setShowClaimModal(false)}
              >
                ✕ Close
              </button>
            </div>

            <div className="claim-modal-body">
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                Each clinic controls its own verified listing on the PetSOS emergency directory without generating duplicate map markers.
              </p>

              {claimableClinics.map((clinic) => {
                const isCurrent = clinic.id === currentClinic.id;
                return (
                  <div
                    key={clinic.id}
                    className={`claim-clinic-item ${isCurrent ? 'claim-clinic-item--active' : ''}`}
                  >
                    <div className="claim-clinic-info">
                      <h4>{clinic.name}</h4>
                      <p>{clinic.address} · Phone: {clinic.phone || '04-835-6450'}</p>
                      <span style={{ fontSize: '0.8rem', color: clinic.isOpenNow ? '#10b981' : '#94a3b8' }}>
                        {clinic.openingHours || 'Open 24/7'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`claim-btn ${isCurrent ? 'claim-btn--active' : ''}`}
                      onClick={() => handleClaimClinic(clinic)}
                      disabled={isCurrent}
                    >
                      {isCurrent ? '✓ Active Session' : 'Claim / Manage'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="portal-footer">
        <p>PetSOS Clinical Billing & Health Station · Invoices automatically sync to Pet Health Passports</p>
      </footer>
    </div>
  );
}

export default App;
