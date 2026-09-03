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

      {/* ── My Pets (Instagram Highlights Style) ── */}
      {profile.pets && profile.pets.length > 0 && (
        <div className="profile-pets-highlights-tray" style={{ marginTop: '0.85rem', marginBottom: '0.5rem', width: '100%' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', textAlign: 'left' }}>
            🐾 Family Pets ({profile.pets.length})
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
            {profile.pets.map((pet) => (
              <div
                key={pet._id || pet.name}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', flexShrink: 0, width: 64 }}
              >
                <div style={{ width: 54, height: 54, borderRadius: '50%', padding: 2, background: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #38bdf8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}
                    alt={pet.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-bg-elevated, #1f2b42)' }}
                  />
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 64 }}>
                  {pet.name}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 64 }}>
                  {pet.breed}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
