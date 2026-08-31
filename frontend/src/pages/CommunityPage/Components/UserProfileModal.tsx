import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, MessageCircle, UserPlus, UserCheck, ShieldAlert, Grid, List, Edit3, Heart, MoreVertical, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import type { UserProfileData } from './SocialProfileBar';
import type { PostItem } from '../../../schemas';
import { VerificationBadge } from '../../../Components/VerificationBadge/VerificationBadge';
import { API_URL } from '../../../config/api';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
  onOpenMessage: (targetUser: UserProfileData) => void;
  onOpenReport: (targetUser: UserProfileData) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  onClose,
  onOpenMessage,
  onOpenReport,
}) => {
  const { user: authUser, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [activeView, setActiveView] = useState<'grid' | 'feed'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [handleStatus, setHandleStatus] = useState<{ checking: boolean; available?: boolean; message?: string }>({ checking: false });

  const isSelf = authUser?.id === userId || (userId === 'current-user' && authUser);

  // Debounced real-time handle availability checking
  useEffect(() => {
    if (!isEditing || !editHandle.trim() || editHandle === profile?.handle) {
      setHandleStatus({ checking: false });
      return;
    }

    const timer = setTimeout(async () => {
      setHandleStatus({ checking: true });
      try {
        const res = await axios.get<{ available: boolean; handle: string; message: string }>(`${API_URL}/community/check-handle`, {
          params: { handle: editHandle },
        });
        setHandleStatus({ checking: false, available: res.data.available, message: res.data.message });
      } catch {
        setHandleStatus({ checking: false });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [editHandle, isEditing, profile?.handle]);

  const fetchProfileAndPosts = async () => {
    setIsLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        axios.get<UserProfileData>(`${API_URL}/community/users/${userId}/profile`),
        axios.get<PostItem[]>(`${API_URL}/community/users/${userId}/posts`),
      ]);

      setProfile(profileRes.data);
      setPosts(postsRes.data || []);
      setEditName(profileRes.data.name);
      setEditBio(profileRes.data.bio);
      setEditHandle(profileRes.data.handle);
    } catch (err) {
      console.error('Failed to load user profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPosts();
  }, [userId]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to follow pet parents', 'info', '🔒 Sign In Required');
      openAuthModal('/community');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/community/users/${userId}/follow`);
      setProfile((prev) => (prev ? { ...prev, isFollowing: res.data.isFollowing, followersCount: res.data.targetUser.followersCount } : prev));
      showToast(
        res.data.isFollowing ? `Now following ${profile?.name}` : `Unfollowed ${profile?.name}`,
        'info',
        res.data.isFollowing ? '👥 Following' : 'Unfollowed'
      );
    } catch (err) {
      showToast('Follow action failed. Please try again.', 'error', '❌ Action Failed');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (handleStatus.available === false) {
      showToast(handleStatus.message || 'Handle is not available.', 'error', '❌ Invalid Handle');
      return;
    }

    try {
      const res = await axios.patch<UserProfileData>(`${API_URL}/community/profile`, {
        name: editName,
        bio: editBio,
        handle: editHandle,
      });
      setProfile(res.data);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success', '✨ Updated');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      showToast(msg, 'error', '❌ Error');
    }
  };

  if (!profile && isLoading) {
    return (
      <div className="auth-modal-overlay" onClick={onClose}>
        <div className="auth-modal card animate-scale-up" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc', fontWeight: 800 }}>{profile.handle}</h3>
            <VerificationBadge
              type={profile.verificationBadge || (profile.role === 'clinic_admin' ? 'veterinarian' : profile.role === 'store_merchant' ? 'pet_store' : profile.role === 'shelter_org' ? 'animal_shelter' : profile.role === 'superadmin' ? 'platform_admin' : 'none')}
              size="md"
              showLabel={true}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}>
            {!isSelf && (
              <>
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                >
                  <MoreVertical size={18} />
                </button>
                {showMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      background: '#0f172a',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 8,
                      padding: '0.35rem',
                      zIndex: 20,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => { setShowMenu(false); onOpenReport(profile); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '6px 10px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <ShieldAlert size={14} /> Report Profile / User
                    </button>
                  </div>
                )}
              </>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Profile Card Top Row (Avatar + Counters) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                padding: 2,
                background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={profile.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{posts.length}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Posts</div>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{profile.followersCount}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Followers</div>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>{profile.followingCount}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Following</div>
            </div>
          </div>
        </div>

        {/* Bio & Details */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.92rem' }}>{profile.name}</div>
          <p style={{ margin: '0.25rem 0 0.5rem', color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.4 }}>
            {profile.bio || 'Proud pet parent on PetSOS 🐾'}
          </p>

          {profile.petBreeds && profile.petBreeds.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              {profile.petBreeds.map((b: string) => (
                <span
                  key={b}
                  style={{
                    background: 'rgba(56,189,248,0.12)',
                    border: '1px solid rgba(56,189,248,0.25)',
                    color: '#38bdf8',
                    borderRadius: 12,
                    padding: '2px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  🐾 {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {isSelf ? (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              style={{
                flex: 1,
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <Edit3 size={14} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleToggleFollow}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: profile.isFollowing ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #38bdf8, #0284c7)',
                  border: profile.isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  color: profile.isFollowing ? '#f8fafc' : '#0f172a',
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                {profile.isFollowing ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
              </button>

              <button
                type="button"
                onClick={() => onOpenMessage(profile)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#f8fafc',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <MessageCircle size={14} /> Message (E2EE)
              </button>
            </>
          )}
        </div>

        {/* In-Line Profile Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: 10, marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Display Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, padding: '0.4rem', fontSize: '0.85rem' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Handle (@username)</label>
                {handleStatus.checking && <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>Checking availability...</span>}
                {!handleStatus.checking && handleStatus.available === true && <span style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 700 }}>✅ Available</span>}
                {!handleStatus.checking && handleStatus.available === false && <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 700 }}>❌ {handleStatus.message || 'Taken'}</span>}
              </div>
              <input
                type="text"
                value={editHandle}
                onChange={(e) => setEditHandle(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: handleStatus.available === false ? '1px solid #ef4444' : handleStatus.available === true ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '0.4rem',
                  fontSize: '0.85rem',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Bio</label>
              <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={2} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, padding: '0.4rem', fontSize: '0.85rem' }} />
            </div>
            <button type="submit" style={{ padding: '0.5rem', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 6, fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}>
              Save Changes
            </button>
          </form>
        )}

        {/* View Mode Tabs (Grid vs Feed) */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => setActiveView('grid')}
            style={{
              flex: 1,
              padding: '0.6rem',
              background: 'none',
              border: 'none',
              borderBottom: activeView === 'grid' ? '2px solid #38bdf8' : 'none',
              color: activeView === 'grid' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
            }}
          >
            <Grid size={14} /> Grid ({posts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('feed')}
            style={{
              flex: 1,
              padding: '0.6rem',
              background: 'none',
              border: 'none',
              borderBottom: activeView === 'feed' ? '2px solid #38bdf8' : 'none',
              color: activeView === 'feed' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
            }}
          >
            <List size={14} /> Feed
          </button>
        </div>

        {/* Media Content */}
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            <Sparkles size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            No posts shared yet.
          </div>
        ) : activeView === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {posts.map((post) => (
              <div
                key={post._id}
                style={{
                  position: 'relative',
                  paddingTop: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                <img
                  src={post.mediaUrl || post.petAvatar}
                  alt={post.caption}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                    padding: '4px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                  }}
                >
                  <Heart size={10} fill="#ef4444" color="#ef4444" /> {post.likesCount || 0}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {posts.map((post) => (
              <div key={post._id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <img src={post.petAvatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                  <div>
                    <strong style={{ fontSize: '0.82rem', color: '#f8fafc' }}>{post.petName}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: 4 }}>{post.petBreed}</span>
                  </div>
                </div>
                {post.mediaUrl && (
                  <img src={post.mediaUrl} alt="" style={{ width: '100%', borderRadius: 8, maxHeight: 240, objectFit: 'cover', marginBottom: '0.4rem' }} />
                )}
                <p style={{ margin: '0 0 0.35rem', color: '#cbd5e1', fontSize: '0.82rem' }}>{post.caption}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                  <span>❤️ {post.likesCount || 0} likes</span>
                  <span>💬 {post.comments?.length || 0} comments</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
