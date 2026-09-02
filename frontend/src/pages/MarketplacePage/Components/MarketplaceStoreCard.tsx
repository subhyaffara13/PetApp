import React from 'react';
import type { PetShop } from '../../../schemas';
import { Star, Truck, Navigation, Package, Phone, ShieldCheck, Clock, Store } from 'lucide-react';
import { getDirectionsUrl, haversine } from '../../../utils/geo';

interface MarketplaceStoreCardProps {
  shop: PetShop;
  userLocation: { lat: number; lon: number };
  isSelected: boolean;
  onSelectShop: (shop: PetShop) => void;
  onOpenCatalog: (shop: PetShop) => void;
  t: (key: string, fallback?: string) => string;
}

export const MarketplaceStoreCard: React.FC<MarketplaceStoreCardProps> = ({
  shop,
  userLocation,
  isSelected,
  onSelectShop,
  onOpenCatalog,
  t,
}) => {
  const directionsUrl = getDirectionsUrl(shop.location.lat, shop.location.lng);

  const computedDist = typeof shop.distanceKm === 'number'
    ? shop.distanceKm
    : haversine(userLocation.lat, userLocation.lon, shop.location.lat, shop.location.lng);

  const isPartner = Boolean(shop.isRegistered || shop.isClaimed);
  const isOpen = shop.isOpen ?? true;

  const photo = shop.imageUrl || shop.photoUrl || (
    (shop._id || shop.id) === 'shop-haifa-2'
      ? 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300'
      : (shop._id || shop.id) === 'shop-haifa-3'
      ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300'
      : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300'
  );

  return (
    <div
      id={`card-${shop._id || shop.id}`}
      className={`market-bottom-sheet__card ${isSelected ? 'market-bottom-sheet__card--selected' : ''}`}
      onClick={() => onSelectShop(shop)}
    >
      <div className="market-bottom-sheet__card-top">
        <div className="store-thumb-wrap">
          <img src={photo} alt={shop.name} className="store-thumb-img" loading="lazy" />
          {isPartner && (
            <span className="store-partner-badge" title="Official Verified Partner">
              <ShieldCheck size={12} />
            </span>
          )}
        </div>

        <div className="store-title-info">
          <div className="store-title-row">
            <h4 className="market-bottom-sheet__card-name">{shop.name}</h4>
            <span className="market-bottom-sheet__distance">
              {computedDist < 1 ? `${Math.round(computedDist * 1000)}m` : `${computedDist.toFixed(1)} km`}
            </span>
          </div>

          <p className="market-bottom-sheet__address">{shop.address}</p>

          <div className="market-bottom-sheet__tags">
            {typeof shop.rating === 'number' && shop.rating > 0 && (
              <span className="badge badge--rating">
                <Star size={11} fill="#fbbf24" color="#fbbf24" /> {shop.rating.toFixed(1)}
              </span>
            )}

            {isOpen ? (
              <span className="badge badge--success">
                <Clock size={11} /> {t('market.open_now', 'OPEN NOW')}
              </span>
            ) : (
              <span className="badge badge--warning">
                <Clock size={11} /> {t('market.closed', 'CLOSED')}
              </span>
            )}

            {shop.deliveryAvailable ? (
              <span className="badge badge--delivery">
                <Truck size={11} /> {t('market.delivery', 'Delivery Available')}
              </span>
            ) : (
              <span className="badge badge--pickup">
                <Store size={11} /> {t('market.pickup_only', 'Pickup Only')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="market-bottom-sheet__actions" onClick={(e) => e.stopPropagation()}>
        {shop.phone && (
          <a href={`tel:${shop.phone}`} className="btn btn-secondary btn-sm">
            <Phone size={13} /> {t('action.call', 'Call')}
          </a>
        )}

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary btn-sm"
        >
          <Navigation size={13} /> {t('action.directions', 'Directions')}
        </a>

        <button
          type="button"
          className="btn btn-primary btn-sm btn-catalog-view"
          onClick={() => onOpenCatalog(shop)}
        >
          <Package size={14} /> {t('market.view_products', 'View Catalog & Order')}
        </button>
      </div>
    </div>
  );
};
