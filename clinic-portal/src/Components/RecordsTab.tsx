import type { MedicalRecord } from '../schemas';

interface RecordsTabProps {
  filteredRecords: MedicalRecord[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: 'queue' | 'billing' | 'records' | 'status') => void;
}

export const RecordsTab = ({
  filteredRecords,
  searchTerm,
  setSearchTerm,
  setActiveTab,
}: RecordsTabProps) => {
  return (
    <div className="tab-records">
      <div className="records-toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by pet name, diagnosis, or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="records-search"
          />
        </div>

        <button className="btn-primary-record" onClick={() => setActiveTab('billing')}>
          🧾 + New Receipt / Bill Log
        </button>
      </div>

      <div className="records-list">
        {filteredRecords.map((r) => (
          <div key={r._id} className="record-card">
            <div className="record-header">
              <div className="record-pet-title">
                <span className="record-badge record-badge--type">{r.visitType.toUpperCase()}</span>
                <h3>{r.petName}</h3>
                <span className="record-date">📅 {new Date(r.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                {r.receiptNumber && <span className="receipt-ref-badge">🧾 {r.receiptNumber}</span>}
              </div>
              <div className="record-clinic-info">
                <strong>{r.clinicName}</strong>
                <span className="attending-vet">🩺 {r.veterinarianName}</span>
              </div>
            </div>

            <div className="record-body">
              <div className="record-field highlight-field">
                <span className="field-label">Diagnosis & Care Summary:</span>
                <p>{r.diagnosis}</p>
              </div>

              <div className="record-field">
                <span className="field-label">Treatments & Procedures (From Receipt):</span>
                <p>{r.treatmentAdministered}</p>
              </div>

              {r.prescriptions && r.prescriptions.length > 0 && (
                <div className="record-field rx-field">
                  <span className="field-label">💊 Dispensed Prescriptions:</span>
                  <div className="rx-pills">
                    {r.prescriptions.map((rx, i) => (
                      <div key={i} className="rx-pill">
                        <strong>{rx.medicationName}</strong>
                        {rx.notes && <span className="rx-notes"> — {rx.notes}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {r.vaccinations && r.vaccinations.length > 0 && (
                <div className="record-field vax-field">
                  <span className="field-label">💉 Vaccinations:</span>
                  <div className="rx-pills">
                    {r.vaccinations.map((vax, i) => (
                      <div key={i} className="vax-pill">
                        <strong>{vax.vaccineName}</strong> (Batch: {vax.batchNumber}) · Due: {new Date(vax.nextDueDate).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
