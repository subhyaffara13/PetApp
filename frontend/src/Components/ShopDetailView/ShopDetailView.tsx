import { ChevronLeft, ShoppingCart, MapPin, Phone, AlertTriangle } from 'lucide-react';
import { ProductGrid } from '../ProductGrid/ProductGrid';
import type { PetShop, Product } from '../../schemas';
import './ShopDetailView.css';

interface ShopDetailViewProps {
  shop: PetShop;
  cartCount: number;
  onBack: () => void;
  onOpenCart: () => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: string[];
}

export const ShopDetailView = ({
  shop,
  cartCount,
  onBack,
  onOpenCart,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
}: ShopDetailViewProps) => {
  return (
    <div className="marketplace-page page page-padded" id="shop-detail-page">
      <div className="marketplace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ChevronLeft size={16} /> Back to All Shops
        </button>

        {/* Cart/Basket Button is ALWAYS accessible whenever cartCount > 0 */}
        {cartCount > 0 && (
          <button
            className="btn btn-primary btn-sm marketplace-cart-btn"
            onClick={onOpenCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontWeight: 700,
            }}
          >
            <ShoppingCart size={15} />
            <span>Basket ({cartCount})</span>
          </button>
        )}
      </div>

      <div className="shop-detail card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem' }}>{shop.name}</h2>
            <p className="shop-detail__address" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              <MapPin size={14} /> {shop.address}
            </p>
          </div>
          {!shop.isRegistered && (
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', fontWeight: 700, padding: '0.3rem 0.6rem' }}>
              CLOSED / INFO ONLY
            </span>
          )}
        </div>

        <div className="shop-detail__tags" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem' }}>
          {shop.tags.map((tag) => (
            <span key={tag} className="badge badge-tag">
              {tag}
            </span>
          ))}
        </div>

        {shop.isRegistered ? (
          <>
            <h3 className="shop-detail__section" style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Store Products & Inventory</h3>
            <ProductGrid
              products={shop.products || []}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              wishlistIds={wishlistIds}
            />
          </>
        ) : (
          <div className="shop-detail__info-only card" style={{ marginTop: '1.25rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid #f59e0b', padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={20} /> Store Listing Unclaimed
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', margin: '0 0 0.75rem' }}>
              This shop has not yet joined the PetSOS merchant network. Catalog ordering and delivery dispatch are currently unavailable for this location.
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 1rem' }}>
              📍 Address: <strong>{shop.address}</strong>
            </p>
            {shop.phone && (
              <a href={`tel:${shop.phone}`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={14} /> Call Shop ({shop.phone})
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
