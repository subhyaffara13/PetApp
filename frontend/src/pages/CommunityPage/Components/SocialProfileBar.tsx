import React from 'react';
import { Users } from 'lucide-react';
import { VerificationBadge } from '../../../Components/VerificationBadge/VerificationBadge';
import type { VerificationBadge as BadgeType, UserRole } from '../../../schemas';

export interface UserProfileData {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  petBreeds?: string[];
  suggestionReason?: string;
  role?: UserRole;
  isVerified?: boolean;
  verificationBadge?: BadgeType;
  organizationName?: string;
}

interface SocialProfileBarProps {
  profile: UserProfileData;
  totalPosts: number;
  onFilterAll: () => void;
  onOpenFriends: () => void;
}

export const SocialProfileBar: React.FC<SocialProfileBarProps> = ({
  profile,
  totalPosts,
  onFilterAll,
  onOpenFriends,
}) => {
  return (
    <section className="community-profile-bar card animate-fade-in">
      <div className="profile-bar__header">
        <img
          src={profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
          alt={profile.name}
          className="profile-bar__avatar"
        />
        <div className="profile-bar__identity">
          <div className="profile-bar__name-row">
            <h3 className="profile-bar__name">{profile.name}</h3>
            <VerificationBadge
              type={profile.verificationBadge || (profile.role === 'clinic_admin' ? 'veterinarian' : profile.role === 'store_merchant' ? 'pet_store' : profile.role === 'shelter_org' ? 'animal_shelter' : 'none')}
              size="sm"
            />
          </div>
          <p className="profile-bar__handle">{profile.handle}</p>
        </div>
      </div>

      <div className="profile-bar__stats-grid">
        <div className="stat-card" onClick={onFilterAll} title="View your posts">
          <span className="stat-value">{totalPosts}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-card" onClick={onOpenFriends} title="View followers">
          <span className="stat-value">{profile.followersCount}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-card" onClick={onOpenFriends} title="View following">
          <span className="stat-value">{profile.followingCount}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>

      <button className="btn-find-friends" onClick={onOpenFriends}>
        <Users size={14} /> Find Neighbors & Friends
      </button>
    </section>
  );
};
