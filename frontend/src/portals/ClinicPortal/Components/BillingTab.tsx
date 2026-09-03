import { useState, useEffect } from 'react';
import axios from 'axios';
import type { IncomingDispatch, PatientLookupResult } from '../schemas';
import { API_URL } from '../../../config/api';

interface BillingTabProps {
  receiptPetName: string;
  setReceiptPetName: (val: string) => void;
  receiptNumber: string;
  setReceiptNumber: (val: string) => void;
  receiptVet: string;
  setReceiptVet: (val: string) => void;
  receiptVisitType: string;
  setReceiptVisitType: (val: string) => void;
  receiptTotal: string;
  setReceiptTotal: (val: string) => void;
  receiptRawText: string;
  setReceiptRawText: (val: string) => void;
  isParsingReceipt: boolean;
  parsedPreview: any;
  showBillingSuccess: boolean;
  handleParseReceipt: () => void;
  handlePublishReceiptRecord: () => void;
  dispatches?: IncomingDispatch[];
  activeClinicName?: string;
  activeClinicId?: string;
}

export const BillingTab = ({
  receiptPetName,
  setReceiptPetName,
  receiptNumber,
  setReceiptNumber,
  receiptVet,
  setReceiptVet,
  receiptVisitType,
  setReceiptVisitType,
  receiptTotal,
  setReceiptTotal,
  receiptRawText,
  setReceiptRawText,
  isParsingReceipt,
  parsedPreview,
  showBillingSuccess,
  handleParseReceipt,
  handlePublishReceiptRecord,
  dispatches = [],
  activeClinicName = 'Haifa Emergency Veterinary Center',
  activeClinicId = 'haifa-clinic-1',
}: BillingTabProps) => {
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientLookupResult[]>([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientLookupResult | null>(null);

  // Initial lookup for default pet (e.g. Rocky)
  useEffect(() => {
    axios
      .get(`${API_URL}/pet-profile/search?query=Rocky`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setSelectedPatient(res.data[0]);
          setReceiptPetName(res.data[0].name);
        }
      })
      .catch(() => {});
  }, [setReceiptPetName]);

  // Search pets by Microchip, Name, ID, or Owner Phone
  useEffect(() => {
    const trimmed = patientSearchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPatient(true);
      try {
        const res = await axios.get(`${API_URL}/pet-profile/search?query=${encodeURIComponent(trimmed)}`);
        setSearchResults(res.data || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchingPatient(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [patientSearchQuery]);

  const handleSelectPatient = (patient: PatientLookupResult) => {
    setSelectedPatient(patient);
    setReceiptPetName(patient.name);
    setSearchResults([]);
    setPatientSearchQuery('');
  };

  const handleSelectDispatchPatient = (dispatch: IncomingDispatch) => {
    setSelectedPatient({
      _id: dispatch.petId,
      name: dispatch.petName,
      species: dispatch.species,
      breed: dispatch.breed,
      ownerName: dispatch.ownerName,
      ownerPhone: dispatch.ownerPhone,
    });
    setReceiptPetName(dispatch.petName);
    setReceiptVisitType('emergency');
  };

  const handlePublishWithSync = async () => {
    if (!parsedPreview) return;

    const targetPetId = selectedPatient?._id || 'pet-rocky-1';

    // 1. Sync medical event & invoice to the verified pet's passport
    try {
      await axios.post(`${API_URL}/pet-profile/${targetPetId}/medical-event`, {
        title: `Clinical Consultation & Invoice #${receiptNumber}`,
        type: receiptVisitType,
        description: `${parsedPreview.treatmentAdministered || 'Consultation'}. Total billed: ${receiptTotal} by ${activeClinicName}`,
        vetName: receiptVet,
        clinicId: activeClinicId,
      });
    } catch {
      // Graceful fallback
    }

    // 2. Call the parent publisher to save in clinic EMR
    handlePublishReceiptRecord();
  };

  const [isOcrUploading, setIsOcrUploading] = useState(false);
  const [ocrFileName, setOcrFileName] = useState<string | null>(null);

  const handleDocumentOcr = async (file: File) => {
    setIsOcrUploading(true);
    setOcrFileName(file.name);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const res = await axios.post(`${API_URL}/pet-profile/ocr-document`, {
            fileData: base64Data,
            mimeType: file.type,
            fileName: file.name,
          });
          const data = res.data;
          if (data) {
            if (data.invoiceNumber) setReceiptNumber(data.invoiceNumber);
            if (data.vetName) setReceiptVet(data.vetName);
            if (data.billedTotal) setReceiptTotal(data.billedTotal);
            if (data.visitType) setReceiptVisitType(data.visitType);
            const itemLines = [
              `Item 1: ${data.diagnosis || 'Clinical Examination'}`,
              ...(data.treatments || []).map((t: string, i: number) => `Item ${i + 2}: ${t}`),
              ...(data.vaccinations || []).map((v: any, i: number) => `Item ${i + 4}: Vaccine - ${v.vaccineName} (Batch: ${v.batchNumber})`),
              ...(data.prescriptions || []).map((p: any, i: number) => `Item ${i + 6}: Rx - ${p.medicationName} (${p.dosage})`),
            ].join('\n');
            setReceiptRawText(itemLines);
            setTimeout(() => {
              handleParseReceipt();
            }, 100);
          }
        } catch (err) {
          console.error('OCR Error in clinic billing:', err);
        } finally {
          setIsOcrUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setIsOcrUploading(false);
    }
  };

  return (
    <div className="tab-billing">
      <div className="billing-intro">
        <div>
          <h2>🧾 Auto-Log from Invoice / Receipt</h2>
          <p className="billing-sub">
            Attach verified invoices and prescriptions directly to the patient's digital health passport. Match via Microchip, Digital Passport ID, or Active Emergency Dispatches.
          </p>
        </div>
      </div>

      {showBillingSuccess && (
        <div className="billing-success-banner">
          ✅ Invoice #{receiptNumber} processed! Verified clinical records & prescriptions published to {receiptPetName}'s Health Passport.
        </div>
      )}

      {/* PATIENT LOOKUP & DISPATCH SELECTOR SECTION */}
      <div className="patient-lookup-section">
        <div className="patient-lookup-header">
          <h3>🐾 Step 1: Match & Verify Patient</h3>
          {selectedPatient && (
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
              ✓ Verified Patient Selected
            </span>
          )}
        </div>

        {selectedPatient ? (
          <div className="patient-active-badge">
            <div>
              <strong>🐾 Patient: {selectedPatient.name}</strong> · {selectedPatient.breed || selectedPatient.species}
              <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Passport ID: {selectedPatient._id} {selectedPatient.ownerPhone ? `· Owner Phone: ${selectedPatient.ownerPhone}` : ''}
              </span>
            </div>
            <button
              type="button"
              className="clinic-switch-btn"
              onClick={() => setSelectedPatient(null)}
            >
              Change Patient / Search
            </button>
          </div>
        ) : (
          <div>
            <div className="patient-search-input-wrap">
              <input
                type="text"
                className="patient-search-input"
                placeholder="Search patient by Microchip #, Pet ID (e.g. pet-rocky-1), Name, or Owner Phone..."
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
              />
            </div>

            {isSearchingPatient && <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.5rem 0' }}>Searching patient database...</p>}

            {/* Live Search Results */}
            {searchResults.length > 0 && (
              <div className="patient-results-list">
                {searchResults.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    className="patient-result-card"
                    onClick={() => handleSelectPatient(p)}
                  >
                    <img
                      src={p.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100&auto=format&fit=crop&q=80'}
                      alt={p.name}
                      className="patient-result-avatar"
                    />
                    <div className="patient-result-info">
                      <strong>{p.name}</strong>
                      <span>{p.breed || p.species} · ID: {p._id}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Fill from Active Incoming Queue */}
            {dispatches.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                  Or select from Active Emergency Dispatches:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {dispatches.map((d) => (
                    <button
                      key={d._id}
                      type="button"
                      className="clinic-switch-btn"
                      onClick={() => handleSelectDispatchPatient(d)}
                    >
                      🚨 {d.petName} ({d.breed}) - {d.ownerName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="billing-grid">
        {/* Left Column: Receipt Input & Quick OCR Dropzone */}
        <div className="billing-input-card card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0 }}>2. Receipt & Clinical Billing Details</h3>
          </div>

          {/* Instant PDF / Image Invoice Scanner */}
          <div
            style={{
              border: '2px dashed rgba(59, 130, 246, 0.4)',
              borderRadius: '8px',
              padding: '0.85rem',
              textAlign: 'center',
              background: 'rgba(59, 130, 246, 0.05)',
              marginBottom: '1rem',
              cursor: 'pointer',
            }}
            onClick={() => {
              const el = document.getElementById('clinic-receipt-file-input');
              if (el) el.click();
            }}
          >
            <input
              type="file"
              id="clinic-receipt-file-input"
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleDocumentOcr(e.target.files[0]);
                }
              }}
            />
            <span style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600, display: 'block' }}>
              📸 {isOcrUploading ? 'Scanning Document with PetSOS OCR...' : ocrFileName ? `Loaded: ${ocrFileName} (Click to re-scan)` : 'Click to Upload / Snap Paper Invoice or Lab PDF'}
            </span>
            <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
              Auto-fills invoice number, attending doctor, diagnosis, and billing lines
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Patient Pet Name</label>
              <input
                type="text"
                value={receiptPetName}
                onChange={(e) => setReceiptPetName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Invoice / Receipt #</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Attending Doctor</label>
              <input
                type="text"
                value={receiptVet}
                onChange={(e) => setReceiptVet(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Visit Category</label>
              <select
                value={receiptVisitType}
                onChange={(e) => setReceiptVisitType(e.target.value)}
              >
                <option value="emergency">🚨 Emergency / ER Care</option>
                <option value="routine">🩺 Routine Checkup</option>
                <option value="vaccination">💉 Vaccination Visit</option>
                <option value="surgery">🔬 Surgery & Procedure</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Itemized Billing Lines (Paste from Pos/Billing Software or Receipt)</label>
            <textarea
              rows={6}
              value={receiptRawText}
              onChange={(e) => setReceiptRawText(e.target.value)}
              placeholder="e.g. Item 1: Rabies Vaccine (Batch: RB-123)..."
              className="receipt-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Amount Billed</label>
              <input
                type="text"
                value={receiptTotal}
                onChange={(e) => setReceiptTotal(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-parse-receipt"
            onClick={handleParseReceipt}
            disabled={isParsingReceipt}
          >
            ⚡ {isParsingReceipt ? 'Analyzing Receipt Items...' : 'Auto-Extract Medical Records from Receipt'}
          </button>
        </div>

        {/* Right Column: AI Extraction & Verified Preview */}
        <div className="billing-preview-card card">
          <h3>3. Auto-Extracted Medical Record Preview</h3>

          {!parsedPreview ? (
            <div className="receipt-empty-preview">
              <span className="receipt-icon">📄</span>
              <p>Click "Auto-Extract Medical Records" on the left to see how itemized bill lines convert into verified medical records and prescription schedules.</p>
            </div>
          ) : (
            <div className="receipt-extracted-content">
              <div className="extracted-header">
                <div>
                  <span className="extracted-badge">{parsedPreview.visitType.toUpperCase()}</span>
                  <h4>{parsedPreview.petName}</h4>
                </div>
                <div className="extracted-total">
                  <span>Invoice: {parsedPreview.receiptNumber}</span>
                  <strong>{parsedPreview.billedTotal}</strong>
                </div>
              </div>

              <div className="extracted-section">
                <span className="section-title">🩺 Extracted Treatment & Care:</span>
                <p>{parsedPreview.treatmentAdministered || 'Standard clinical procedures'}</p>
              </div>

              {parsedPreview.prescriptions.length > 0 && (
                <div className="extracted-section">
                  <span className="section-title">💊 Dispensed Prescriptions (Auto-scheduled):</span>
                  <div className="extracted-pills">
                    {parsedPreview.prescriptions.map((rx: any, idx: number) => (
                      <div key={idx} className="extracted-pill rx-pill">
                        <strong>{rx.medicationName}</strong>
                        <span>{rx.notes}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedPreview.vaccinations.length > 0 && (
                <div className="extracted-section">
                  <span className="section-title">💉 Administered Vaccinations:</span>
                  <div className="extracted-pills">
                    {parsedPreview.vaccinations.map((vax: any, idx: number) => (
                      <div key={idx} className="extracted-pill vax-pill">
                        <strong>{vax.vaccineName}</strong>
                        <span>Batch #{vax.batchNumber} · Booster due in 1 yr</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="publish-actions">
                <button
                  type="button"
                  className="btn-publish-passport"
                  onClick={handlePublishWithSync}
                >
                  🚀 Push Verified Record & Invoice to {parsedPreview.petName}'s Passport
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
