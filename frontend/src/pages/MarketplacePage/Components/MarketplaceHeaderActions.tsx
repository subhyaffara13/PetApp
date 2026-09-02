import React from 'react';
import { ShoppingBag, Heart, History, Sun, Moon } from 'lucide-react';
import { LanguageSelector } from '../../../Components/LanguageSelector/LanguageSelector';

interface MarketplaceHeaderActionsProps {
  shopsCount: number;
  deliveryCount: number;
  totalCartCount: number;
  wishlistCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenPastOrders: () => void;
  t: (key: string, fallback?: string) => string;
}

export const MarketplaceHeaderActions: React.FC<MarketplaceHeaderActionsProps> = ({
  shopsCount,
  deliveryCount,
  totalCartCount,
  wishlistCount,
  theme,
  onToggleTheme,
  onOpenCart,
  onOpenWishlist,
  onOpenPastOrders,
  t,
}) => {
  return (
    <header className="marketplace-header">
      <div className="marketplace-header__info">
        <p className="eyebrow">{t('market.title', 'Pet Stores & Boutiques')}</p>
        <h1 className="summary-title">
          {shopsCount} {t('market.stores_nearby', 'stores nearby')} · {deliveryCount} {t('market.delivery_available', 'delivery')}
        </h1>
      </div>

      <div className="marketplace-header__actions">
        <LanguageSelector variant="compact" />

        <button
          type="button"
          className="market-fab"
          onClick={onOpenWishlist}
          title={t('market.wishlist', 'Saved Wishlist')}
          aria-label={t('market.wishlist', 'Saved Wishlist')}
        >
          <Heart size={18} color="#ec4899" />
          {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
        </button>

        <button
          type="button"
          className="market-fab"
          onClick={onOpenPastOrders}
          title={t('market.my_orders', 'Past Orders & Receipts')}
          aria-label={t('market.my_orders', 'Past Orders & Receipts')}
        >
          <History size={18} color="#38bdf8" />
        </button>

        <button
          type="button"
          className="market-fab market-fab--cart"
          onClick={onOpenCart}
          title={t('market.cart', 'Shopping Cart')}
          aria-label={t('market.cart', 'Shopping Cart')}
        >
          <ShoppingBag size={18} />
          {totalCartCount > 0 && <span className="cart-badge-count">{totalCartCount}</span>}
        </button>

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};
