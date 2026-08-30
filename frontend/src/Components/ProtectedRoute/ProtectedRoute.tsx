import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
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

  return (
    <div className="protected-gate">
      <div className="protected-gate__card card">
        <div className="protected-gate__icon">
          <Lock size={32} />
        </div>
        <h2>{title}</h2>
        <p>{description}</p>

        <div className="protected-gate__notice">
          <ShieldCheck size={14} />
          <span>Emergency maps remain 100% free & open to all pet owners.</span>
        </div>

        <button
          type="button"
          className="btn btn-primary protected-gate__btn"
          onClick={() => openAuthModal()}
          id="protected-gate-sign-in-btn"
        >
          Sign In to Access <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
