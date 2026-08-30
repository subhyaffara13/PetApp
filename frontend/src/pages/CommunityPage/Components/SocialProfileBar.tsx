import React from 'react';
import { Users } from 'lucide-react';

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
    <section className="community-profile-bar animate-fade-in">
      <div className="profile-bar__left">
        <img src={profile.avatar} alt={profile.name} className="profile-bar__avatar" />
        <div>
          <h3 className="profile-bar__name">{profile.name}</h3>
          <p className="profile-bar__handle">{profile.handle}</p>
        </div>
      </div>

      <div className="profile-bar__stats">
        <div className="stat-item" onClick={onFilterAll}>
          <span className="stat-value">{totalPosts}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-item" onClick={onOpenFriends}>
          <span className="stat-value">{profile.followersCount}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-item" onClick={onOpenFriends}>
          <span className="stat-value">{profile.followingCount}</span>
          <span className="stat-label">Following</span>
        </div>
      </div>

      <button className="btn-find-friends" onClick={onOpenFriends}>
        <Users size={14} /> Friends
      </button>
    </section>
  );
};
