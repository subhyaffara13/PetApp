import React from 'react';
import { ShoppingBag, Heart, History, Store as StoreIcon } from 'lucide-react';
import { ThemeToggle } from '../../../Components/ThemeToggle/ThemeToggle';
import { LanguageSelector } from '../../../Components/LanguageSelector/LanguageSelector';

interface MarketplaceHeaderActionsProps {
  totalCartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenPastOrders: () => void;
  t: (key: string, fallback?: string) => string;
}

export const MarketplaceHeaderActions: React.FC<MarketplaceHeaderActionsProps> = ({
  totalCartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenPastOrders,
  t,
}) => {
  return (
    <div className="marketplace-header-row">
      <div className="header-title-group">
        <h2>
          <StoreIcon size={24} color="#f97316" /> {t('market.title', 'Pet Shops & Stores')}
        </h2>
        <p className="page-subtitle">
          {t('market.subtitle', 'Premium food, toys & pharmacy with direct local pickup or delivery')}
        </p>
      </div>

      <div className="marketplace-action-bar">
        <ThemeToggle />
        <LanguageSelector />

        <button
          type="button"
          className="btn-market-action"
          onClick={onOpenWishlist}
          title={t('market.wishlist', 'Wishlist')}
        >
          <Heart size={16} color="#ec4899" />
          {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
        </button>

        <button
          type="button"
          className="btn-market-action"
          onClick={onOpenPastOrders}
          title={t('market.my_orders', 'My Orders')}
        >
          <History size={16} color="#38bdf8" />
        </button>

        <button
          type="button"
          className="btn-market-cart"
          onClick={onOpenCart}
          title={t('market.cart', 'Cart')}
        >
          <ShoppingBag size={18} />
          <span>Cart</span>
          {totalCartCount > 0 && <span className="cart-badge-count">{totalCartCount}</span>}
        </button>
      </div>
    </div>
  );
};
