import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

interface CategoryFilterSectionProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryFilterSection: React.FC<CategoryFilterSectionProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const { t } = useTranslation();
  const filtersScrollRef = useRef<HTMLDivElement>(null);

  const slideFilters = (direction: 'left' | 'right') => {
    if (filtersScrollRef.current) {
      const offset = direction === 'left' ? -180 : 180;
      filtersScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="feed-filters-section">
      <div className="filters-slider-wrapper">
        <button className="filter-arrow-btn filter-arrow-btn--left" onClick={() => slideFilters('left')} aria-label="Scroll filters left">
          <ChevronLeft size={14} />
        </button>

        <div className="feed-filters" ref={filtersScrollRef}>
          <button
            className={`filter-pill ${activeCategory === 'all' ? 'filter-pill--active' : ''}`}
            onClick={() => onSelectCategory('all')}
          >
            {t('community.filter_all', 'All Moments')}
          </button>
          <button
            className={`filter-pill ${activeCategory === 'lost_found' ? 'filter-pill--active' : ''}`}
            onClick={() => onSelectCategory('lost_found')}
          >
            {t('community.filter_lost', '🚨 Lost & Found (30d)')}
          </button>
          <button
            className={`filter-pill ${activeCategory === 'adoption' ? 'filter-pill--active' : ''}`}
            onClick={() => onSelectCategory('adoption')}
          >
            {t('community.filter_adoption', '🏡 For Adoption')}
          </button>
          <button
            className={`filter-pill ${activeCategory === 'health_tip' ? 'filter-pill--active' : ''}`}
            onClick={() => onSelectCategory('health_tip')}
          >
            {t('community.filter_health', '🩺 Vet & Health Tips')}
          </button>
          <button
            className={`filter-pill ${activeCategory === 'playdate' ? 'filter-pill--active' : ''}`}
            onClick={() => onSelectCategory('playdate')}
          >
            {t('community.filter_playdate', '🐕 Playdates')}
          </button>
          <button
            className={`filter-pill ${activeCategory === 'cute' ? 'filter-pill--active' : ''}`}
            onClick={() => onSelectCategory('cute')}
          >
            {t('community.filter_cute', '✨ Cute Snaps')}
          </button>
        </div>

        <button className="filter-arrow-btn filter-arrow-btn--right" onClick={() => slideFilters('right')} aria-label="Scroll filters right">
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  );
};
