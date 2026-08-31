import { ChevronLeft, ShoppingCart, MapPin, Phone, ExternalLink, Clock, ShieldCheck, AlertCircle, Package } from 'lucide-react';
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
  const isClaimed = shop.isClaimed ?? shop.isRegistered;
  const isOpen = shop.isOpen ?? true;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${shop.name} ${shop.address}`
  )}`;

  return (
    <div className="marketplace-page page page-padded" id="shop-detail-page">
      <div className="marketplace-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ChevronLeft size={16} /> Back to All Shops
        </button>

        {/* Cart/Basket Button */}
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

      <div className="shop-detail card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.45rem', fontWeight: 800 }}>{shop.name}</h2>
            <p className="shop-detail__address" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              <MapPin size={14} /> {shop.address}
            </p>
          </div>

          {/* ── Separate Status Badges ── */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {/* Status 1: Open / Closed Badge */}
            {isOpen ? (
              <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.6rem' }}>
                <Clock size={12} /> Open Now
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.6rem' }}>
                <Clock size={12} /> Closed Now
              </span>
            )}

            {/* Status 2: Claimed / Unclaimed Badge */}
            {isClaimed ? (
              <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.6rem' }}>
                <ShieldCheck size={12} /> Verified Partner
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 700, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.6rem' }}>
                <AlertCircle size={12} /> Unclaimed Listing
              </span>
            )}
          </div>
        </div>

        {/* Feature Tags */}
        <div className="shop-detail__tags" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {shop.tags.map((tag) => (
            <span key={tag} className="badge badge-tag">
              {tag}
            </span>
          ))}
        </div>

        {/* Contact and Directions Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          {shop.phone && (
            <a href={`tel:${shop.phone}`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={14} /> Call Store ({shop.phone})
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--color-border)' }}
          >
            <ExternalLink size={14} /> View on Google Maps
          </a>
        </div>

        {/* ── Unclaimed Listing Warning Card ── */}
        {!isClaimed && (
          <div className="shop-detail__info-only card" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '1.25rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.4rem' }}>
              <AlertCircle size={18} /> Unclaimed Directory Listing — Available via Phone / Address
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', margin: '0 0 0.5rem', lineHeight: 1.45 }}>
              This local shop information was indexed from public business directories. Online in-app ordering and DaaS delivery dispatch are reserved for verified merchant partners.
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
              📞 To purchase items, please call them at <strong>{shop.phone || 'the listed number'}</strong> or visit their physical storefront at <strong>{shop.address}</strong>.
            </p>
          </div>
        )}

        {/* ── Products & Inventory (Only for Claimed Stores) ── */}
        {isClaimed && (
          <div style={{ marginTop: '0.5rem' }}>
            <h3 className="shop-detail__section" style={{ marginBottom: '0.75rem', fontSize: '1.1rem', fontWeight: 800 }}>Store Products & Inventory</h3>
            {shop.products && shop.products.length > 0 ? (
              <ProductGrid
                products={shop.products}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                wishlistIds={wishlistIds}
              />
            ) : (
              <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                <Package size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ margin: '0 0 0.25rem', fontWeight: 700, color: 'var(--color-text)' }}>No online catalog products listed yet</p>
                <p style={{ margin: 0, fontSize: '0.82rem' }}>Please call the store at {shop.phone} or visit them in person for their latest in-stock supplies!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
