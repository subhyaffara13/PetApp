import React from 'react';
import { Users } from 'lucide-react';
import type { CoParentRequest } from '../../../schemas';

interface CoParentBannerProps {
  pendingRequests: CoParentRequest[];
  onClick: () => void;
}

export const CoParentBanner: React.FC<CoParentBannerProps> = ({
  pendingRequests,
  onClick,
}) => {
  if (pendingRequests.length === 0) return null;

  return (
    <div className="coparent-invitation-banner" onClick={onClick}>
      <div className="banner-left">
        <div className="banner-icon-pulse">
          <Users size={18} color="#38bdf8" />
        </div>
        <div>
          <strong>
            {pendingRequests.length} Co-Parenting Invitation
            {pendingRequests.length > 1 ? 's' : ''} Pending
          </strong>
          <p>
            {pendingRequests[0].fromUserName} invited you to share care for{' '}
            <strong>{pendingRequests[0].petName}</strong> (expires in 24h)
          </p>
        </div>
      </div>
      <button className="btn btn-primary btn-xs">Review</button>
    </div>
  );
};
