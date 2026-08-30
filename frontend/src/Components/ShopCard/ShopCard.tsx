import type { PetShop } from '../../schemas';
import { MapPin, Star, Truck, Store, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './ShopCard.css';

interface ShopCardProps {
  shop: PetShop;
  onClick: () => void;
}

export const ShopCard = ({ shop, onClick }: ShopCardProps) => {
  const { t } = useTranslation();

  const photo = shop.photoUrl || (
    shop._id === 'shop-haifa-2'
      ? 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300'
      : shop._id === 'shop-haifa-3'
      ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300'
      : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300'
  );

  return (
    <button
      className={`shop-card card ${!shop.isRegistered ? 'shop-card--unclaimed' : ''}`}
      onClick={onClick}
      id={`shop-card-${shop._id}`}
      style={{ opacity: !shop.isRegistered ? 0.85 : 1 }}
    >
      <div className="shop-card__header">
        <div className="shop-card__img-wrap" style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <img src={photo} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="shop-card__info">
          <h4 className="shop-card__name">{shop.name}</h4>
          <p className="shop-card__address">
            <MapPin size={12} /> {shop.address}
          </p>
        </div>
        {shop.rating && (
          <div className="shop-card__rating">
            <Star size={12} fill="var(--color-status-limited)" />
            <span>{shop.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="shop-card__tags">
        {shop.deliveryAvailable && (
          <span className="badge badge-tag">
            <Truck size={10} /> {t('market.tag_delivery', 'Delivery')}
          </span>
        )}
        {shop.pickupOnly && (
          <span className="badge badge-tag">
            <Store size={10} /> {t('market.tag_pickup_only', 'Pickup Only')}
          </span>
        )}
        {shop.tags.map((tag) => (
          <span key={tag} className="badge badge-tag">{tag}</span>
        ))}
      </div>

      {!shop.isRegistered ? (
        <div className="shop-card__info-only" style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.4rem 0.65rem', borderRadius: 6, marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.72rem' }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <AlertCircle size={12} /> CLOSED / UNCLAIMED LISTING — ADDRESS & CALL ONLY
          </div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.68rem' }}>
            Information sourced from public directories. Catalog ordering unavailable until claimed.
          </span>
        </div>
      ) : null}
    </button>
  );
};
