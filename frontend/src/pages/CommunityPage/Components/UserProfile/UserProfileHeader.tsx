import React from 'react';
import { MessageCircle, UserPlus, UserCheck, ShieldAlert, Edit3, MoreVertical, Calendar } from 'lucide-react';
import type { UserProfileData } from '../SocialProfileBar';
import { VerificationBadge } from '../../../../Components/VerificationBadge/VerificationBadge';

interface UserProfileHeaderProps {
  profile: UserProfileData;
  isSelf: boolean;
  isFollowing: boolean;
  showMenu: boolean;
  setShowMenu: (val: boolean) => void;
  onEdit: () => void;
  onFollowToggle: () => void;
  onOpenMessage: () => void;
  onOpenReport: () => void;
  onBookService?: () => void;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  profile,
  isSelf,
  isFollowing,
  showMenu,
  setShowMenu,
  onEdit,
  onFollowToggle,
  onOpenMessage,
  onOpenReport,
  onBookService,
}) => {
  const isServiceProvider =
    profile.role && ['veterinarian', 'groomer', 'dog_walker', 'pet_sitter'].includes(profile.role);

  return (
    <div className="profile-modal-header-info">
      <div className="profile-avatar-wrapper">
        <img src={profile.avatar} alt={profile.name} className="profile-large-avatar" />
      </div>

      <div className="profile-title-row">
        <div className="name-badge-group">
          <h3>{profile.name}</h3>
          <VerificationBadge type={profile.verificationBadge || profile.role} />
        </div>
        <span className="profile-handle">@{profile.handle}</span>
      </div>

      {profile.bio && <p className="profile-bio-text">{profile.bio}</p>}

      <div className="profile-stats-row">
        <div className="stat-col">
          <strong>{profile.postsCount ?? 0}</strong>
          <span>Posts</span>
        </div>
        <div className="stat-col">
          <strong>{profile.followersCount ?? 0}</strong>
          <span>Followers</span>
        </div>
        <div className="stat-col">
          <strong>{profile.followingCount ?? 0}</strong>
          <span>Following</span>
        </div>
      </div>

      <div className="profile-cta-row">
        {isSelf ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onEdit}>
            <Edit3 size={14} /> Edit Profile
          </button>
        ) : (
          <>
            <button
              type="button"
              className={`btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
              onClick={onFollowToggle}
            >
              {isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenMessage}>
              <MessageCircle size={14} /> Message
            </button>
            {isServiceProvider && onBookService && (
              <button type="button" className="btn btn-primary btn-sm btn-book-service" onClick={onBookService}>
                <Calendar size={14} /> Book Service
              </button>
            )}
            <div className="more-menu-wrapper">
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={16} />
              </button>
              {showMenu && (
                <div className="profile-dropdown-menu">
                  <button type="button" className="menu-item-danger" onClick={onOpenReport}>
                    <ShieldAlert size={14} /> Report User
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
