import type { IncomingDispatch } from '../schemas';

interface QueueTabProps {
  dispatches: IncomingDispatch[];
  handleUpdateDispatchStatus: (id: string, nextStatus: string) => Promise<void>;
  setReceiptPetName: (name: string) => void;
  setReceiptRawText: (text: string) => void;
  setActiveTab: (tab: 'queue' | 'billing' | 'records' | 'status') => void;
}

export const QueueTab = ({
  dispatches,
  handleUpdateDispatchStatus,
  setReceiptPetName,
  setReceiptRawText,
  setActiveTab,
}: QueueTabProps) => {
  return (
    <div className="tab-queue">
      <div className="queue-header">
        <div>
          <h2>Incoming Emergency Dispatches</h2>
          <p className="queue-sub">Pre-arrival files transmitted from pet parents in transit</p>
        </div>
        <div className="queue-metrics">
          <div className="metric-box">
            <span className="metric-num">{dispatches.filter((d) => d.status === 'en_route').length}</span>
            <span className="metric-label">En Route</span>
          </div>
          <div className="metric-box">
            <span className="metric-num">{dispatches.filter((d) => d.status === 'arrived').length}</span>
            <span className="metric-label">In Triage</span>
          </div>
        </div>
      </div>

      {dispatches.length === 0 ? (
        <div className="empty-queue-card">
          <span className="empty-icon">🩺</span>
          <h3>No active emergency transports</h3>
          <p>Incoming alerts will broadcast here in real-time when owners notify the clinic.</p>
        </div>
      ) : (
        <div className="dispatches-grid">
          {dispatches.map((d) => (
            <div
              key={d._id}
              className={`dispatch-card dispatch-card--${d.urgency} ${d.status === 'arrived' ? 'dispatch-card--arrived' : ''}`}
            >
              <div className="dispatch-top">
                <span className={`urgency-badge urgency-badge--${d.urgency}`}>
                  {d.urgency.toUpperCase()}
                </span>
                <span className="eta-badge">
                  ⏱️ ETA: ~{d.etaMinutes} mins
                </span>
              </div>

              <div className="patient-hero">
                <div className="patient-avatar">🐾</div>
                <div className="patient-meta">
                  <h3>{d.petName}</h3>
                  <p>{d.species} · {d.breed}</p>
                </div>
              </div>

              <div className="symptom-box">
                <strong>Reported Symptoms / Incident:</strong>
                <p>{d.symptoms}</p>
              </div>

              <div className="clinical-tags">
                {d.allergies && d.allergies.length > 0 && (
                  <div className="tag-group alert-tag">
                    <span>⚠️ Allergies:</span> {d.allergies.join(', ')}
                  </div>
                )}
                {d.conditions && d.conditions.length > 0 && (
                  <div className="tag-group info-tag">
                    <span>📋 Conditions:</span> {d.conditions.join(', ')}
                  </div>
                )}
              </div>

              <div className="owner-row">
                <span>👤 {d.ownerName}</span>
                <a href={`tel:${d.ownerPhone}`} className="btn-call">
                  📞 {d.ownerPhone}
                </a>
              </div>

              <div className="dispatch-actions">
                {d.status === 'en_route' && (
                  <button
                    className="btn-action btn-arrive"
                    onClick={() => handleUpdateDispatchStatus(d._id, 'arrived')}
                  >
                    Mark Arrived & Start Triage
                  </button>
                )}
                {d.status === 'arrived' && (
                  <button
                    className="btn-action btn-admit"
                    onClick={() => {
                      setReceiptPetName(d.petName);
                      setReceiptRawText(`Item 1: Emergency Trauma Consultation (${d.symptoms})\nItem 2: Pain Management & Anti-inflammatory`);
                      setActiveTab('billing');
                    }}
                  >
                    🧾 Generate Receipt & Log Visit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
