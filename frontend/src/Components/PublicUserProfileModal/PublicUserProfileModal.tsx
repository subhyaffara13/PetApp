import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X, UserCheck, UserPlus, MessageCircle, MapPin,
  Sparkles, Heart, MessageSquare, Video, Loader2
} from 'lucide-react';
import { API_URL } from '../../config/api';
import { VerificationBadge } from '../VerificationBadge/VerificationBadge';
import './PublicUserProfileModal.css';

interface PublicPetSummary {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age?: number;
  photoUrl?: string;
  gender?: string;
}

interface UserProfileData {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  role?: string;
  isVerified?: boolean;
  verificationBadge?: string;
  organizationName?: string;
  pets?: PublicPetSummary[];
  posts?: any[];
}

interface PublicUserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialName?: string;
  initialAvatar?: string;
  onOpenDirectMessage?: (userId: string, userName: string) => void;
  onSelectPost?: (post: any) => void;
}

const SPECIES_EMOJIS: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🦜',
  reptile: '🦎',
  small_mammal: '🐹',
  other: '🐾',
};

export const PublicUserProfileModal: React.FC<PublicUserProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialName,
  initialAvatar,
  onOpenDirectMessage,
  onSelectPost,
}) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PublicPetSummary | null>(null);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let isMounted = true;
    setIsLoading(true);
    setSelectedPet(null);

    const fetchProfile = async () => {
      try {
        const res = await axios.get<UserProfileData>(`${API_URL}/community/users/${userId}/profile`);
        if (isMounted && res.data) {
          setProfile(res.data);
          setIsFollowing(Boolean(res.data.isFollowing));
          if (res.data.pets && res.data.pets.length > 0) {
            setSelectedPet(res.data.pets[0]);
          }
        }
      } catch (err) {
        console.warn('Could not load public profile', err);
        // Fallback default structure
        if (isMounted) {
          setProfile({
            id: userId,
            name: initialName || 'Pet Parent',
            handle: `@${(initialName || 'user').toLowerCase().replace(/\s+/g, '')}`,
            avatar: initialAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            bio: 'Pet lover in the neighborhood 🐾',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            pets: [],
            posts: [],
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, initialName, initialAvatar]);

  const handleToggleFollow = async () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    if (profile) {
      setProfile({
        ...profile,
        followersCount: Math.max(0, profile.followersCount + (nextState ? 1 : -1)),
        isFollowing: nextState,
      });
    }

    try {
      await axios.post(`${API_URL}/community/users/${userId}/follow`);
    } catch {
      // Revert if network fails
      setIsFollowing(!nextState);
    }
  };

  if (!isOpen) return null;

  const displayName = profile?.name || initialName || 'Pet Parent';
  const displayAvatar = profile?.avatar || initialAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
  const displayBio = profile?.bio || 'Pet lover in the neighborhood 🐾';
  const pets = profile?.pets || [];
  const posts = profile?.posts || [];

  return (
    <div className="public-profile-overlay" onClick={onClose}>
      <div className="public-profile-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="public-profile-header">
          <div className="public-profile-header-title">
            <span>🐾 {profile?.handle || '@petparent'}</span>
            {profile?.isVerified && (
              <VerificationBadge type={(profile?.verificationBadge as any) || 'veterinarian'} size="sm" />
            )}
          </div>
          <button type="button" className="public-profile-close-btn" onClick={onClose} title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="public-profile-body">
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', gap: '0.75rem' }}>
              <Loader2 size={32} className="spin" style={{ color: '#38bdf8' }} />
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Loading profile...</span>
            </div>
          ) : (
            <>
              {/* Profile Hero Header */}
              <div className="profile-hero-section">
                <div className="profile-hero-avatar-wrapper">
                  <img src={displayAvatar} alt={displayName} className="profile-hero-avatar" />
                  {profile?.isVerified && <div className="profile-hero-badge">✓</div>}
                </div>

                <div className="profile-hero-details">
                  <div className="profile-hero-name-row">
                    <h3 className="profile-hero-name">{displayName}</h3>
                    {profile?.organizationName && (
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                        • {profile.organizationName}
                      </span>
                    )}
                  </div>
                  <span className="profile-hero-handle">{profile?.handle || '@petparent'}</span>
                  <p className="profile-hero-bio">{displayBio}</p>
                  <div className="profile-hero-location">
                    <MapPin size={13} />
                    <span>Haifa & Northern District</span>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="profile-stats-row">
                <div className="profile-stat-item">
                  <span className="profile-stat-value">{pets.length}</span>
                  <span className="profile-stat-label">Pets</span>
                </div>
                <div className="profile-stat-item">
                  <span className="profile-stat-value">{profile?.postsCount || posts.length}</span>
                  <span className="profile-stat-label">Posts</span>
                </div>
                <div className="profile-stat-item">
                  <span className="profile-stat-value">{profile?.followersCount || 0}</span>
                  <span className="profile-stat-label">Followers</span>
                </div>
                <div className="profile-stat-item">
                  <span className="profile-stat-value">{profile?.followingCount || 0}</span>
                  <span className="profile-stat-label">Following</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="profile-actions-row">
                <button
                  type="button"
                  className={`profile-btn-follow ${isFollowing ? 'profile-btn-follow--following' : ''}`}
                  onClick={handleToggleFollow}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={16} /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} /> Follow
                    </>
                  )}
                </button>

                {onOpenDirectMessage && (
                  <button
                    type="button"
                    className="profile-btn-dm"
                    onClick={() => {
                      onOpenDirectMessage(userId, displayName);
                      onClose();
                    }}
                  >
                    <MessageCircle size={16} /> Message
                  </button>
                )}
              </div>

              {/* ── "My Pets" Highlight Carousel ── */}
              {pets.length > 0 && (
                <div className="profile-pets-section">
                  <div className="profile-section-title">
                    <Sparkles size={14} style={{ color: '#f59e0b' }} />
                    <span>My Pets ({pets.length})</span>
                  </div>

                  <div className="profile-pets-carousel">
                    {pets.map((pet) => (
                      <button
                        key={pet._id}
                        type="button"
                        className="pet-highlight-card"
                        onClick={() => setSelectedPet(pet)}
                      >
                        <div className="pet-highlight-avatar-ring">
                          <img
                            src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}
                            alt={pet.name}
                            className="pet-highlight-avatar"
                          />
                        </div>
                        <span className="pet-highlight-name">
                          {SPECIES_EMOJIS[pet.species] || '🐾'} {pet.name}
                        </span>
                        <span className="pet-highlight-species">{pet.breed}</span>
                      </button>
                    ))}
                  </div>

                  {/* Selected Pet Quick View Banner */}
                  {selectedPet && (
                    <div className="pet-quick-view-sheet">
                      <img
                        src={selectedPet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150'}
                        alt={selectedPet.name}
                        className="pet-quick-view-avatar"
                      />
                      <div className="pet-quick-view-info">
                        <span className="pet-quick-view-name">
                          {SPECIES_EMOJIS[selectedPet.species] || '🐾'} {selectedPet.name}
                        </span>
                        <span className="pet-quick-view-meta">
                          {selectedPet.breed} • {selectedPet.age ? `${selectedPet.age} yrs old` : 'Active passport'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Instagram-Style 3-Column Media Grid ── */}
              <div className="profile-pets-section">
                <div className="profile-section-title">
                  <span>Community Moments ({posts.length})</span>
                </div>

                {posts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', background: '#0f172a', borderRadius: 12, color: '#94a3b8', fontSize: '0.85rem' }}>
                    No public community posts shared yet.
                  </div>
                ) : (
                  <div className="profile-media-grid">
                    {posts.map((post) => {
                      const isVideo = Boolean(post.imageUrl?.match(/\.(mp4|webm|mov|ogg)($|\?)/i));
                      return (
                        <div
                          key={post._id}
                          className="profile-media-cell"
                          onClick={() => onSelectPost?.(post)}
                        >
                          {isVideo ? (
                            <video src={post.imageUrl} muted playsInline />
                          ) : (
                            <img src={post.imageUrl || post.petAvatar} alt={post.caption || 'Post'} />
                          )}

                          {isVideo && (
                            <div className="profile-media-video-badge">
                              <Video size={12} />
                            </div>
                          )}

                          <div className="profile-media-overlay">
                            <div className="profile-media-overlay-stat">
                              <Heart size={14} fill="#fff" />
                              <span>{post.likesCount || 0}</span>
                            </div>
                            <div className="profile-media-overlay-stat">
                              <MessageSquare size={14} fill="#fff" />
                              <span>{post.comments?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
