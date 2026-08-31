import type { CapacityStatus, StatusOption } from '../schemas';

interface StatusTabProps {
  status: CapacityStatus;
  currentStatus: StatusOption;
  lastUpdated: Date | null;
  error: string | null;
  isUpdating: boolean;
  statusOptions: StatusOption[];
  updateStatus: (newStatus: CapacityStatus) => Promise<void>;
}

export const StatusTab = ({
  status,
  currentStatus,
  lastUpdated,
  error,
  isUpdating,
  statusOptions,
  updateStatus,
}: StatusTabProps) => {
  return (
    <div className="tab-settings">
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
    </div>
  );
};
