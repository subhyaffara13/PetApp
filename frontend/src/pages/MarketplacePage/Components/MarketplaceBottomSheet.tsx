import { useEffect, useRef, useState, useCallback } from 'react';
import type { PetShop, UserLocation } from '../../../schemas';
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react';
import { MarketplaceStoreCard } from './MarketplaceStoreCard';
import { haversine } from '../../../utils/geo';

interface MarketplaceBottomSheetProps {
  shops: PetShop[];
  userLocation: UserLocation;
  selectedShop: PetShop | null;
  onSelectShop: (shop: PetShop) => void;
  onOpenCatalog: (shop: PetShop) => void;
  t: (key: string, fallback?: string) => string;
}

const TAG_FILTERS = [
  { id: 'all', label: 'All Shops' },
  { id: 'delivery', label: '🚀 Delivery' },
  { id: 'partner', label: '⭐ Partners' },
  { id: 'pharmacy', label: '💊 Pharmacy' },
  { id: 'food', label: '🥩 Food' },
  { id: 'toys', label: '🎾 Toys' },
];

export const MarketplaceBottomSheet = ({
  shops,
  userLocation,
  selectedShop,
  onSelectShop,
  onOpenCatalog,
  t,
}: MarketplaceBottomSheetProps) => {
  const [sheetHeight, setSheetHeight] = useState<number>(32);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startDragY = useRef<number>(0);
  const startHeight = useRef<number>(32);
  const [activeTag, setActiveTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sortedShops = [...shops]
    .map((s) => {
      const dist = typeof s.distanceKm === 'number'
        ? s.distanceKm
        : haversine(userLocation.lat, userLocation.lon, s.location.lat, s.location.lng);
      return { ...s, computedDist: dist };
    })
    .sort((a, b) => a.computedDist - b.computedDist);

  const displayShops = sortedShops.filter((shop) => {
    if (activeTag === 'delivery' && !shop.deliveryAvailable) return false;
    if (activeTag === 'partner' && !shop.isRegistered && !shop.isClaimed) return false;
    if (activeTag === 'pharmacy' && !shop.name.toLowerCase().includes('pharm') && !shop.name.toLowerCase().includes('vet')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        shop.name.toLowerCase().includes(q) ||
        (shop.address || '').toLowerCase().includes(q) ||
        (shop.phone || '').includes(q)
      );
    }
    return true;
  });

  const selectedShopId = selectedShop?._id || selectedShop?.id;

  useEffect(() => {
    if (!selectedShopId) return;
    setSheetHeight((prev) => (prev < 32 ? 40 : prev));
    const cardEl = document.getElementById(`card-${selectedShopId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardEl.classList.add('flash');
      const timer = setTimeout(() => cardEl.classList.remove('flash'), 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedShopId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startDragY.current = e.clientY;
    startHeight.current = sheetHeight;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const deltaY = startDragY.current - e.clientY;
      const deltaVh = (deltaY / window.innerHeight) * 100;
      setSheetHeight(Math.max(8, Math.min(65, startHeight.current + deltaVh)));
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    },
    [isDragging]
  );

  const toggleExpand = () => {
    setSheetHeight((prev) => (prev > 35 ? 18 : 55));
  };

  return (
    <div
      className={`market-bottom-sheet ${sheetHeight > 35 ? 'market-bottom-sheet--expanded' : ''} ${isDragging ? 'is-dragging' : ''}`}
      style={{ height: `${sheetHeight}vh` }}
    >
      <div
        className="market-bottom-sheet__handle-wrapper"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={toggleExpand}
      >
        <div className="market-bottom-sheet__handle" />
        <span className="drag-hint-text">
          {sheetHeight > 35 ? <ChevronDown size={14} /> : <ChevronUp size={14} />}{' '}
          {t('market.sheet_drag_hint', 'Drag to adjust · ')} {displayShops.length} {t('market.stores_count', 'pet shops nearby')}
        </span>
      </div>

      <div className="market-bottom-sheet__search-filter-row">
        <div className="market-search-box">
          <Search size={14} className="market-search-icon" />
          <input
            type="text"
            id="market-shop-search"
            name="marketShopSearch"
            aria-label={t('market.search_placeholder', 'Search pet shops or products...')}
            autoComplete="off"
            className="market-search-input"
            placeholder={t('market.search_placeholder', 'Search pet shops or products...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="market-search-clear"
              onClick={() => setSearchQuery('')}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="market-tags-filter-bar">
          {TAG_FILTERS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={`market-tag-pill ${activeTag === tag.id ? 'active' : ''}`}
              onClick={() => setActiveTag(tag.id)}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="market-bottom-sheet__cards">
        {displayShops.map((shop) => (
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

        {displayShops.length === 0 && (
          <div className="sheet-empty-state">
            <p>No pet stores match the current search or filter.</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setActiveTag('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
