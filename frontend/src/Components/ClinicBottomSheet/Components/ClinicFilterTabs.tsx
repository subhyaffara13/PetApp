import React from 'react';
import { Search, X } from 'lucide-react';

interface ClinicFilterTabsProps {
  clinicFilter: 'all' | 'open' | 'verified' | 'capacity' | 'mobile';
  setClinicFilter: (filter: 'all' | 'open' | 'verified' | 'capacity' | 'mobile') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  t: (key: string, fallback?: string) => string;
}

export const ClinicFilterTabs: React.FC<ClinicFilterTabsProps> = ({
  clinicFilter,
  setClinicFilter,
  searchQuery,
  setSearchQuery,
  t,
}) => {
  return (
    <>
      <div className="sheet-search-row">
        <div className="sheet-search-box">
          <Search size={14} className="sheet-search-icon" />
          <input
            type="text"
            className="sheet-search-input"
            placeholder={t('emergency.search_placeholder', 'Search city or clinic name...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="sheet-search-clear"
              onClick={() => setSearchQuery('')}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="clinic-filter-bar">
        <button
          className={`clinic-filter-pill ${clinicFilter === 'all' ? 'active' : ''}`}
          onClick={() => setClinicFilter('all')}
        >
          {t('emergency.filter_all', 'All Clinics')}
        </button>
        <button
          className={`clinic-filter-pill ${clinicFilter === 'open' ? 'active' : ''}`}
          onClick={() => setClinicFilter('open')}
        >
          {t('emergency.filter_open', '🟢 Open Now')}
        </button>
        <button
          className={`clinic-filter-pill ${clinicFilter === 'verified' ? 'active' : ''}`}
          onClick={() => setClinicFilter('verified')}
        >
          {t('emergency.filter_verified', '⭐ Verified PIMS Direct')}
        </button>
        <button
          className={`clinic-filter-pill ${clinicFilter === 'mobile' ? 'active' : ''}`}
          onClick={() => setClinicFilter('mobile')}
        >
          🚐 Mobile Vets
        </button>
      </div>
    </>
  );
};
