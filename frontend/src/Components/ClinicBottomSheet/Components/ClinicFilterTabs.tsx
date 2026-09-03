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
    <div className="clinic-bottom-sheet__search-filter-row">
      <div className="clinic-search-box">
        <Search size={14} className="clinic-search-icon" />
        <input
          type="text"
          id="clinic-search-input"
          name="clinic-search-input"
          aria-label={t('emergency.search_placeholder', 'Search city or clinic name...')}
          autoComplete="off"
          className="clinic-search-input"
          placeholder={t('emergency.search_placeholder', 'Search city or emergency clinic...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="clinic-search-clear"
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="clinic-tags-filter-bar">
        <button
          className={`clinic-tag-pill ${clinicFilter === 'all' ? 'active' : ''}`}
          onClick={() => setClinicFilter('all')}
        >
          {t('emergency.filter_all', 'All Clinics')}
        </button>
        <button
          className={`clinic-tag-pill ${clinicFilter === 'open' ? 'active active-open' : ''}`}
          onClick={() => setClinicFilter('open')}
        >
          🟢 {t('emergency.filter_open', 'Open Now')}
        </button>
        <button
          className={`clinic-tag-pill ${clinicFilter === 'verified' ? 'active active-verified' : ''}`}
          onClick={() => setClinicFilter('verified')}
        >
          ⭐ {t('emergency.filter_verified', 'Verified 24/7 ER')}
        </button>
        <button
          className={`clinic-tag-pill ${clinicFilter === 'mobile' ? 'active active-mobile' : ''}`}
          onClick={() => setClinicFilter('mobile')}
        >
          🚐 Mobile Vets
        </button>
      </div>
    </div>
  );
};

