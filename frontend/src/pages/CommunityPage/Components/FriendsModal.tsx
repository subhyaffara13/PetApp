import React from 'react';
import { UserCheck, UserPlus } from 'lucide-react';
import type { UserProfileData } from './SocialProfileBar';

interface FriendsModalProps {
  isOpen: boolean;
  users: UserProfileData[];
  onClose: () => void;
  onToggleFollow: (id: string, name: string) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  users,
  onClose,
  onToggleFollow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h3>👥 Community Pet Parents</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            Connect with local dog walkers, cat parents, and veterinary professionals in Haifa.
          </p>
          <div className="friends-list">
            {users.filter((u) => u.id !== 'current-user').map((user) => (
              <div key={user.id} className="friend-card-row">
                <div className="friend-left-info">
                  <img src={user.avatar} alt={user.name} className="friend-avatar" />
                  <div className="friend-names">
                    <h4>{user.name}</h4>
                    <p>{user.handle} · {user.followersCount} followers</p>
                    <span className="friend-stats-tag">{user.bio}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn-follow-author ${user.isFollowing ? 'btn-follow-author--following' : ''}`}
                  onClick={() => onToggleFollow(user.id, user.name)}
                >
                  {user.isFollowing ? <><UserCheck size={12} /> Following</> : <><UserPlus size={12} /> Follow</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
