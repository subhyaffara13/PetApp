import React from 'react';
import { X, Heart, ShoppingBag, Trash2, Store, ArrowRight } from 'lucide-react';
import './WishlistDrawer.css';

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  shopName?: string;
  shopId?: string;
}

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: WishlistItem[];
  onRemove: (id: string) => void;
  onMoveToCart: (item: WishlistItem) => void;
  onSelectShop?: (shopId: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemove,
  onMoveToCart,
  onSelectShop,
}) => {
  if (!isOpen) return null;

  // Group wishlist items by store
  const groupedByStore = wishlist.reduce<Record<string, { shopName: string; shopId: string; items: WishlistItem[] }>>(
    (acc, item) => {
      const storeId = item.shopId || 'general-store';
      const storeName = item.shopName || 'Pet Supplies Store';
      if (!acc[storeId]) {
        acc[storeId] = { shopName: storeName, shopId: storeId, items: [] };
      }
      acc[storeId].items.push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="wishlist-overlay" onClick={onClose}>
      <div className="wishlist-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="wishlist-header">
          <div className="wishlist-title-row">
            <Heart color="#ef4444" fill="#ef4444" size={20} />
            <h3>My Wishlist ({wishlist.length})</h3>
          </div>
          <button className="btn-close-wishlist" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="wishlist-body">
          {wishlist.length === 0 ? (
            <div className="wishlist-empty-state">
              <Heart size={40} color="#64748b" />
              <p>Your wishlist is currently empty.</p>
              <small>Click the ❤️ icon on any product in the marketplace to save it for later!</small>
            </div>
          ) : (
            <div className="wishlist-stores-list">
              {Object.values(groupedByStore).map((group) => (
                <div key={group.shopId} className="wishlist-store-group card" style={{ marginBottom: '1rem', padding: '0.75rem' }}>
                  <div
                    className="wishlist-store-header"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--color-border)',
                      paddingBottom: '0.5rem',
                      marginBottom: '0.65rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      onClose();
                      onSelectShop?.(group.shopId);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Store size={15} color="var(--color-primary)" />
                      <strong style={{ fontSize: '0.85rem' }}>{group.shopName}</strong>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      Visit Shop <ArrowRight size={12} />
                    </span>
                  </div>

                  <div className="wishlist-items-list">
                    {group.items.map((item) => (
                      <div key={item._id} className="wishlist-item-card" style={{ marginBottom: '0.5rem' }}>
                        <div className="wishlist-item-details">
                          <span className="wishlist-cat-badge">{item.category}</span>
                          <strong className="wishlist-item-name">{item.name}</strong>
                          <span className="wishlist-item-price">₪{item.price.toFixed(2)}</span>
                        </div>
                        <div className="wishlist-item-actions">
                          <button
                            type="button"
                            className="btn-wishlist-cart"
                            onClick={() => onMoveToCart(item)}
                          >
                            <ShoppingBag size={13} /> Add to Cart
                          </button>
                          <button
                            type="button"
                            className="btn-wishlist-remove"
                            onClick={() => onRemove(item._id)}
                            title="Remove from wishlist"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
