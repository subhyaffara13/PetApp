import React from 'react';
import { Scissors, ShieldCheck, RefreshCw } from 'lucide-react';

interface GroomerHeaderProps {
  activeCount: number;
  completedToday: number;
  todayRevenue: number;
  onRefresh: () => void;
}

export const GroomerHeader: React.FC<GroomerHeaderProps> = ({
  activeCount,
  completedToday,
  todayRevenue,
  onRefresh,
}) => {
  return (
    <header className="groomer-header">
      <div className="groomer-brand-row">
        <div className="groomer-logo-box">
          <Scissors size={24} color="#38bdf8" />
        </div>
        <div>
          <div className="groomer-title-with-badge">
            <h1 className="groomer-salon-name">PetSOS Elite Grooming & Spa Studio</h1>
            <span className="groomer-verified-badge">
              <ShieldCheck size={14} /> Verified Groomer Pro
            </span>
          </div>
          <p className="groomer-salon-sub">
            Professional styling, coat conditioning, spa treatments & instant itemized invoicing
          </p>
        </div>
      </div>

      <div className="groomer-header-stats">
        <div className="header-stat-pill">
          <span className="stat-label">Active Queue</span>
          <span className="stat-num active">{activeCount}</span>
        </div>
        <div className="header-stat-pill">
          <span className="stat-label">Finished Today</span>
          <span className="stat-num">{completedToday}</span>
        </div>
        <div className="header-stat-pill">
          <span className="stat-label">Revenue</span>
          <span className="stat-num revenue">₪{todayRevenue.toFixed(0)}</span>
        </div>
        <button className="btn-portal-refresh" onClick={onRefresh} title="Refresh Live Schedule">
          <RefreshCw size={15} />
        </button>
      </div>
    </header>
  );
};
