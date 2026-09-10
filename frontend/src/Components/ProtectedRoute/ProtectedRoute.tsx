import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Bot,
  HeartPulse,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Users,
} from 'lucide-react';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  title,
  description,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const lowerTitle = title.toLowerCase();
  const isAssistant = lowerTitle.includes('assistant') || lowerTitle.includes('ai');
  const isProfile = lowerTitle.includes('profile') || lowerTitle.includes('passport') || lowerTitle.includes('pet');
  const isCommunity = lowerTitle.includes('community') || lowerTitle.includes('social');
  const isShop = lowerTitle.includes('shop') || lowerTitle.includes('market') || lowerTitle.includes('delivery');

  return (
    <div className="protected-gate" id="protected-gate-view">
      <div className="protected-gate__backdrop-glow" />
      <div className="protected-gate__card card">
        <div className="protected-gate__badge">
          {isAssistant ? (
            <Bot size={14} className="protected-gate__badge-icon" />
          ) : isProfile ? (
            <HeartPulse size={14} className="protected-gate__badge-icon" />
          ) : isCommunity ? (
            <Users size={14} className="protected-gate__badge-icon" />
          ) : isShop ? (
            <ShoppingBag size={14} className="protected-gate__badge-icon" />
          ) : (
            <Sparkles size={14} className="protected-gate__badge-icon" />
          )}
          <span>PetSOS Free Member Access</span>
        </div>

        <div className="protected-gate__icon-container">
          <div className="protected-gate__icon-halo" />
          {isAssistant ? (
            <Bot size={34} />
          ) : isProfile ? (
            <HeartPulse size={34} />
          ) : isCommunity ? (
            <Users size={34} />
          ) : isShop ? (
            <ShoppingBag size={34} />
          ) : (
            <Lock size={34} />
          )}
        </div>

        <h2 className="protected-gate__title">{title}</h2>
        <p className="protected-gate__description">{description}</p>

        {/* Feature Highlights Grid */}
        <div className="protected-gate__features">
          {isAssistant ? (
            <>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Instant toxic food & household hazard scanner</span>
              </div>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>24/7 AI-guided triage & clinical urgency check</span>
              </div>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Personalized breed & age specific wellness advice</span>
              </div>
            </>
          ) : isProfile ? (
            <>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Digital Pet Passport with NFC collar chip sync</span>
              </div>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Vaccination tracker & upcoming appointment alerts</span>
              </div>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Emergency contacts & medical condition history</span>
              </div>
            </>
          ) : isCommunity ? (
            <>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Connect with verified local pet parents nearby</span>
              </div>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Post pet stories, photos & lost-and-found alerts</span>
              </div>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>End-to-end encrypted direct messaging between users</span>
              </div>
            </>
          ) : isShop ? (
            <>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Verified partner pet stores with rapid local delivery</span>
              </div>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Save favorites to your personalized pet wishlist</span>
              </div>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Real-time order tracking, receipts & doorstep delivery</span>
              </div>
            </>
          ) : (
            <>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Verified pet store catalogs & fast DaaS delivery</span>
              </div>
              <div className="protected-gate__feature-item">
                <CheckCircle2 size={16} className="feature-check-icon" />
                <span>Real-time order tracking & doorstep dispatch</span>
              </div>
            </>
          )}
        </div>

        <div className="protected-gate__notice">
          <ShieldCheck size={15} />
          <span>Always 100% free for pet owners. Takes 15 seconds.</span>
        </div>

        <button
          type="button"
          className="btn btn-primary protected-gate__btn"
          onClick={() => openAuthModal()}
          id="protected-gate-sign-in-btn"
        >
          <span>Create Free Account / Sign In</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
