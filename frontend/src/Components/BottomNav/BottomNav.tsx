import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MessageCircle,
  PawPrint,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './BottomNav.css';

interface NavItem {
  path: string;
  translationKey: string;
  defaultLabel: string;
  icon: React.ElementType;
  isSos?: boolean;
}

const navItems: NavItem[] = [
  { path: '/community', translationKey: 'nav.community', defaultLabel: 'Community', icon: Sparkles },
  { path: '/chat', translationKey: 'nav.assistant', defaultLabel: 'Assistant', icon: MessageCircle },
  { path: '/', translationKey: 'nav.emergency', defaultLabel: 'Emergency', icon: AlertTriangle, isSos: true },
  { path: '/profile', translationKey: 'nav.pets', defaultLabel: 'Health & Pets', icon: PawPrint },
  { path: '/marketplace', translationKey: 'nav.shops', defaultLabel: 'Shops', icon: ShoppingBag },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <nav className="bottom-nav" id="bottom-navigation">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        const label = t(item.translationKey, item.defaultLabel);

        return (
          <button
            key={item.path}
            id={`nav-${item.defaultLabel.toLowerCase().replace(/\s/g, '-')}`}
            className={[
              'bottom-nav__item',
              isActive && 'bottom-nav__item--active',
              item.isSos && 'bottom-nav__item--sos',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => navigate(item.path)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bottom-nav__indicator" />
            <Icon className="bottom-nav__icon" strokeWidth={isActive ? 2.5 : 2} />
            <span className="bottom-nav__label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
