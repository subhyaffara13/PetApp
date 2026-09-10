import type { CapacityStatus, StatusOption } from '../schemas';

interface StatusTabProps {
  status: CapacityStatus;
  currentStatus: StatusOption;
  portalOverride?: 'open' | 'closed' | 'schedule';
  openingHours?: string;
  lastUpdated: Date | null;
  error: string | null;
  isUpdating: boolean;
  statusOptions: StatusOption[];
  updateStatus: (newStatus: CapacityStatus) => Promise<void>;
  updatePortalOverride?: (override: 'open' | 'closed' | 'schedule') => Promise<void>;
}

export const StatusTab = ({
  status,
  currentStatus,
  portalOverride = 'schedule',
  openingHours,
  lastUpdated,
  error,
  isUpdating,
  statusOptions,
  updateStatus,
  updatePortalOverride,
}: StatusTabProps) => {
  return (
    <div className="tab-settings" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. CAPACITY & TRIAGE STATUS CARD */}
      <div className="capacity-card">
        <div
          className="capacity-card__indicator"
          style={{
            '--indicator-color': currentStatus.color,
            '--indicator-glow': currentStatus.glow,
          } as any}
        >
          <span className="capacity-card__emoji">{currentStatus.emoji}</span>
        </div>

        <h2 className="capacity-card__status">{currentStatus.label}</h2>
        <p className="capacity-card__desc">{currentStatus.description}</p>

        {lastUpdated && (
          <p className="capacity-card__time">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {error && <p className="capacity-card__error">⚠️ {error}</p>}

        <div className="capacity-card__toggles">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              className={`toggle-btn ${status === opt.value ? 'toggle-btn--active' : ''}`}
              style={{ '--btn-color': opt.color, '--btn-glow': opt.glow } as any}
              onClick={() => updateStatus(opt.value)}
              disabled={isUpdating || status === opt.value}
            >
              <span className="toggle-btn__emoji">{opt.emoji}</span>
              <span className="toggle-btn__label">{opt.label}</span>
              {status === opt.value && <span className="toggle-btn__check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 2. PORTAL OPERATING STATUS & OPEN NOW FLAG DECLARATION */}
      {updatePortalOverride && (
        <div
          className="capacity-card"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.5rem',
          }}
        >
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🚨</span> Live Directory "Open Now" Flag Declaration
            </h3>
            <p style={{ margin: '0.35rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              Control whether the public map displays your clinic as <strong>🟢 Open Now</strong>.
              You can declare your clinic open immediately (e.g. for emergencies or extended hours) or follow standard working hours ({openingHours || 'Standard Hours'}).
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
            <button
              type="button"
              className={`toggle-btn ${portalOverride === 'open' ? 'toggle-btn--active' : ''}`}
              style={{
                '--btn-color': '#10b981',
                '--btn-glow': 'rgba(16, 185, 129, 0.25)',
                padding: '0.85rem 1rem',
              } as any}
              onClick={() => updatePortalOverride('open')}
              disabled={isUpdating || portalOverride === 'open'}
            >
              <span className="toggle-btn__emoji">🟢</span>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem' }}>Declared Open</strong>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Force Open Now</span>
              </div>
              {portalOverride === 'open' && <span className="toggle-btn__check">✓</span>}
            </button>

            <button
              type="button"
              className={`toggle-btn ${portalOverride === 'schedule' ? 'toggle-btn--active' : ''}`}
              style={{
                '--btn-color': '#3b82f6',
                '--btn-glow': 'rgba(59, 130, 246, 0.25)',
                padding: '0.85rem 1rem',
              } as any}
              onClick={() => updatePortalOverride('schedule')}
              disabled={isUpdating || portalOverride === 'schedule'}
            >
              <span className="toggle-btn__emoji">🕒</span>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem' }}>Follow Schedule</strong>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Standard Hours</span>
              </div>
              {portalOverride === 'schedule' && <span className="toggle-btn__check">✓</span>}
            </button>

            <button
              type="button"
              className={`toggle-btn ${portalOverride === 'closed' ? 'toggle-btn--active' : ''}`}
              style={{
                '--btn-color': '#ef4444',
                '--btn-glow': 'rgba(239, 68, 68, 0.25)',
                padding: '0.85rem 1rem',
              } as any}
              onClick={() => updatePortalOverride('closed')}
              disabled={isUpdating || portalOverride === 'closed'}
            >
              <span className="toggle-btn__emoji">🔴</span>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem' }}>Declared Closed</strong>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Force Closed</span>
              </div>
              {portalOverride === 'closed' && <span className="toggle-btn__check">✓</span>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
