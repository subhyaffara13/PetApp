import React from 'react';
import { Filter } from 'lucide-react';
import { ShopCard } from '../../../Components/ShopCard/ShopCard';
import type { PetShop } from '../../../schemas';

interface ShopListGridProps {
  isLoading: boolean;
  shops: PetShop[];
  onSelectShop: (shop: PetShop) => void;
}

export const ShopListGrid: React.FC<ShopListGridProps> = ({
  isLoading,
  shops,
  onSelectShop,
}) => {
  if (isLoading) {
    return (
      <div className="marketplace-skeletons">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-lg)' }} />
        ))}
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="marketplace-empty animate-fade-in">
        <Filter size={32} />
        <p>No shops found</p>
        <span>Try a different search or filter</span>
      </div>
    );
  }

  return (
    <div className="marketplace-list">
      {shops.map((shop, i) => (
        <div key={shop._id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
          <ShopCard shop={shop} onClick={() => onSelectShop(shop)} />
        </div>
      ))}
    </div>
  );
};
