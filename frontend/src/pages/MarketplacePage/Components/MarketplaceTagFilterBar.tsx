import React from 'react';

const TAG_FILTERS = ['All', '🛵 Wolt Delivery', '💊 Pharmacy', '🍖 Food', '🧸 Toys', '🏥 Health'];

interface MarketplaceTagFilterBarProps {
  activeTag: string;
  onSelectTag: (tag: string) => void;
}

export const MarketplaceTagFilterBar: React.FC<MarketplaceTagFilterBarProps> = ({
  activeTag,
  onSelectTag,
}) => {
  return (
    <div className="marketplace-tags-filter-bar">
      {TAG_FILTERS.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`market-tag-pill ${activeTag === tag ? 'active' : ''}`}
          onClick={() => onSelectTag(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};
