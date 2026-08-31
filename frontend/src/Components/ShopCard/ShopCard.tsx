import type { PetShop } from '../../schemas';
import { MapPin, Star, Truck, Store, Clock, Phone, ShieldCheck, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './ShopCard.css';

interface ShopCardProps {
  shop: PetShop;
  onClick: () => void;
}

export const ShopCard = ({ shop, onClick }: ShopCardProps) => {
  const { t } = useTranslation();

  const isClaimed = shop.isClaimed ?? shop.isRegistered;
  const isOpen = shop.isOpen ?? true;

  const photo = shop.imageUrl || shop.photoUrl || (
    shop._id === 'shop-haifa-2'
      ? 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300'
      : shop._id === 'shop-haifa-3'
      ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300'
      : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300'
  );

  return (
    <button
      className={`shop-card card ${!isClaimed ? 'shop-card--unclaimed' : ''}`}
      onClick={onClick}
      id={`shop-card-${shop._id}`}
      style={{
        opacity: !isOpen ? 0.75 : 1,
        transition: 'all var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
      }}
    >
      <div className="shop-card__header">
        <div className="shop-card__img-wrap" style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
          <img src={photo} alt={shop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="shop-card__info" style={{ flex: 1, minWidth: 0 }}>
          <h4 className="shop-card__name" style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.2rem' }}>{shop.name}</h4>
          <p className="shop-card__address" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={12} /> {shop.address}
          </p>
        </div>
        {typeof shop.rating === 'number' && shop.rating > 0 && (
          <div className="shop-card__rating" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '0.2rem 0.45rem', borderRadius: 6 }}>
            <Star size={12} fill="#f59e0b" />
            <span>{shop.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* ── Status Row: Display Operating Status and Claimed Status SEPARATELY ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
        {/* Status 1: Open / Closed Badge */}
        {isOpen ? (
          <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={11} /> Open Now
          </span>
        ) : (
          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={11} /> Closed Now
          </span>
        )}

        {/* Status 2: Claimed vs Unclaimed Listing Badge */}
        {isClaimed ? (
          <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <ShieldCheck size={11} /> Verified Partner Store
          </span>
        ) : (
          <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <AlertCircle size={11} /> Unclaimed Listing (Call / Address Only)
          </span>
        )}
      </div>

      {/* Feature Tags (Delivery, Pickup, etc.) */}
      <div className="shop-card__tags">
        {shop.deliveryAvailable && isClaimed && (
          <span className="badge badge-tag" style={{ fontSize: '0.68rem' }}>
            <Truck size={10} /> {t('market.tag_delivery', 'Direct Delivery')}
          </span>
        )}
        {shop.pickupOnly && (
          <span className="badge badge-tag" style={{ fontSize: '0.68rem' }}>
            <Store size={10} /> {t('market.tag_pickup_only', 'In-Store Pickup')}
          </span>
        )}
        {shop.tags?.filter((t) => t !== 'Delivery' && t !== 'Pickup Only').map((tag) => (
          <span key={tag} className="badge badge-tag" style={{ fontSize: '0.68rem' }}>{tag}</span>
        ))}
      </div>

      {/* Unclaimed Notice footer */}
      {!isClaimed && (
        <div style={{ background: 'rgba(245, 158, 11, 0.06)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.35rem 0.5rem', borderRadius: 6, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Phone size={12} /> Sourced from directory. Reach out by phone or visit the address.
        </div>
      )}
    </button>
  );
};
