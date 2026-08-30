import React from 'react';
import { Heart, Package } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';
import { ThemeToggle } from '../../../Components/ThemeToggle/ThemeToggle';

interface MarketplaceHeaderProps {
  wishlistCount: number;
  onOpenPastOrders: () => void;
  onOpenWishlist: () => void;
}

export const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  wishlistCount,
  onOpenPastOrders,
  onOpenWishlist,
}) => {
  const { t } = useTranslation();

  return (
    <div className="page-header marketplace-page-header">
      <h1 className="page-title">{t('market.title', 'Pet Shops')}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          className="btn-open-past-orders"
          onClick={onOpenPastOrders}
          style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid #38bdf8',
            color: '#38bdf8',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            fontWeight: 700,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
          }}
        >
          <Package size={14} />
          {t('market.my_orders', 'My Orders')}
        </button>

        <button
          type="button"
          className="btn-open-wishlist"
          onClick={onOpenWishlist}
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            fontWeight: 700,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
          }}
        >
          <Heart size={14} fill={wishlistCount > 0 ? '#ef4444' : 'none'} />
          {t('market.wishlist', 'Wishlist')} ({wishlistCount})
        </button>

        <ThemeToggle className="theme-toggle-btn-page" />
      </div>
    </div>
  );
};
