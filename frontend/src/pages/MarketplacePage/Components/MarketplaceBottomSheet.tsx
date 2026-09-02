import React from 'react';
import type { PetShop } from '../../../schemas';
import { ChevronUp, ChevronDown, Store as StoreIcon } from 'lucide-react';
import { MarketplaceStoreCard } from './MarketplaceStoreCard';
import { MarketplaceTagFilterBar } from './MarketplaceTagFilterBar';

interface MarketplaceBottomSheetProps {
  shops: PetShop[];
  userLocation: { lat: number; lon: number };
  selectedShop: PetShop | null;
  isSheetExpanded: boolean;
  activeTag: string;
  onToggleExpand: () => void;
  onSelectTag: (tag: string) => void;
  onSelectShop: (shop: PetShop) => void;
  onOpenCatalog: (shop: PetShop) => void;
  t: (key: string, fallback?: string) => string;
}

export const MarketplaceBottomSheet: React.FC<MarketplaceBottomSheetProps> = ({
  shops,
  userLocation,
  selectedShop,
  isSheetExpanded,
  activeTag,
  onToggleExpand,
  onSelectTag,
  onSelectShop,
  onOpenCatalog,
  t,
}) => {
  const filteredShops = shops.filter((shop) => {
    if (activeTag === 'All') return true;
    if (activeTag.includes('Wolt Delivery')) return shop.deliveryAvailable;
    if (activeTag.includes('Pharmacy')) return shop.name.toLowerCase().includes('pharmacy') || shop.name.toLowerCase().includes('vet');
    if (activeTag.includes('Food')) return true;
    return true;
  });

  return (
    <div className={`market-bottom-sheet ${isSheetExpanded ? 'expanded' : ''}`}>
      <div className="sheet-handle-bar" onClick={onToggleExpand}>
        <div className="sheet-drag-pill" />
        <div className="sheet-header-title">
          <StoreIcon size={16} color="#f97316" />
          <span>Pet Stores & Boutiques Nearby ({filteredShops.length})</span>
          {isSheetExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      <div className="sheet-content-scroll">
        <MarketplaceTagFilterBar activeTag={activeTag} onSelectTag={onSelectTag} />

        <div className="market-stores-grid">
          {filteredShops.map((shop) => (
            <MarketplaceStoreCard
              key={shop._id || shop.id || shop.name}
              shop={shop}
              userLocation={userLocation}
              isSelected={(selectedShop?._id || selectedShop?.id) === (shop._id || shop.id)}
              onSelectShop={onSelectShop}
              onOpenCatalog={onOpenCatalog}
              t={t}
            />
          ))}
          {filteredShops.length === 0 && (
            <div className="sheet-empty-state">No pet shops found in this area.</div>
          )}
        </div>
      </div>
    </div>
  );
};
