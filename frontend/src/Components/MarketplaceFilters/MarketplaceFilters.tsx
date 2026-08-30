import { Search } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './MarketplaceFilters.css';

interface MarketplaceFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  activeTag: string;
  onTagChange: (tag: string) => void;
  tags: string[];
}

export const MarketplaceFilters = ({
  searchQuery,
  onSearchChange,
  activeTag,
  onTagChange,
  tags,
}: MarketplaceFiltersProps) => {
  const { t } = useTranslation();

  const getTagLabel = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'all': return t('market.filter_all', 'All');
      case 'delivery': return t('market.filter_delivery', 'Delivery');
      case 'pickup only': return t('market.filter_pickup', 'Pickup Only');
      case 'food': return t('market.filter_food', 'Food');
      case 'toys': return t('market.filter_toys', 'Toys');
      case 'grooming': return t('market.filter_grooming', 'Grooming');
      case 'health': return t('market.filter_health', 'Health');
      default: return tag;
    }
  };

  return (
    <div className="marketplace-filters-wrapper">
      {/* Search Input */}
      <div className="marketplace-search">
        <Search size={16} className="marketplace-search__icon" />
        <input
          className="input marketplace-search__input"
          placeholder={t('market.search_placeholder', 'Search shops...')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          id="shop-search-input"
        />
      </div>

      {/* Tag Filters */}
      <div className="marketplace-tags">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`marketplace-tag ${activeTag === tag ? 'marketplace-tag--active' : ''}`}
            onClick={() => onTagChange(tag)}
          >
            {getTagLabel(tag)}
          </button>
        ))}
      </div>
    </div>
  );
};
