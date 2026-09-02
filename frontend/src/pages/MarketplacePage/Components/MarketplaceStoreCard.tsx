import React from 'react';
import type { PetShop } from '../../../schemas';
import { Star, Truck, Navigation, Package } from 'lucide-react';
import { getDirectionsUrl } from '../../../utils/geo';

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
  isSelected,
  onSelectShop,
  onOpenCatalog,
  t,
}) => {
  const directionsUrl = getDirectionsUrl(shop.location.lat, shop.location.lng);

  return (
    <div
      key={shop._id || shop.id}
      className={`market-store-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelectShop(shop)}
    >
      <div className="store-card-photo-wrapper">
        <img
          src={shop.photoUrl || shop.imageUrl || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300'}
          alt={shop.name}
          className="store-card-img"
        />
        {shop.isRegistered && <span className="store-badge-verified">⭐ Official Partner</span>}
      </div>

      <div className="store-card-body">
        <div className="store-card-header-row">
          <h4 className="store-name">{shop.name}</h4>
          <span className="store-distance">
            {shop.distanceKm ? `${shop.distanceKm.toFixed(1)} km` : 'Near you'}
          </span>
        </div>

        <p className="store-address">{shop.address}</p>

        <div className="store-meta-tags">
          {shop.rating && (
            <span className="meta-tag rating">
              <Star size={11} fill="#fbbf24" color="#fbbf24" /> {shop.rating}
            </span>
          )}
          {shop.deliveryAvailable ? (
            <span className="meta-tag delivery">
              <Truck size={11} /> {t('market.tag_delivery', 'Delivery Available')}
            </span>
          ) : (
            <span className="meta-tag pickup">
              {t('market.tag_pickup_only', 'Pickup Only')}
            </span>
          )}
        </div>

        <div className="store-card-actions" onClick={(e) => e.stopPropagation()}>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-xs"
          >
            <Navigation size={12} /> {t('action.directions', 'Directions')}
          </a>

          <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={() => onOpenCatalog(shop)}
          >
            <Package size={12} /> View Products
          </button>
        </div>
      </div>
    </div>
  );
};
