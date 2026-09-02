import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import type { UserProfileData } from './SocialProfileBar';
import type { PostItem } from '../../../schemas';
import { UserProfileHeader } from './UserProfile/UserProfileHeader';
import { UserProfileEditForm } from './UserProfile/UserProfileEditForm';
import { UserProfilePostsGrid } from './UserProfile/UserProfilePostsGrid';
import { UniversalBookingModal, type BookingProviderContext } from '../../../Components/UniversalBookingModal/UniversalBookingModal';
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
  const [isSaving, setIsSaving] = useState(false);
  const [bookingProvider, setBookingProvider] = useState<BookingProviderContext | null>(null);

  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [handleStatus, setHandleStatus] = useState<{ checking: boolean; available?: boolean; message?: string }>({ checking: false });

  const isSelf = authUser?.id === userId || (userId === 'current-user' && Boolean(authUser));

  useEffect(() => {
    if (!isEditing || !editHandle.trim() || editHandle === profile?.handle) {
      setHandleStatus({ checking: false });
      return;
    }
    const timer = setTimeout(async () => {
      setHandleStatus({ checking: true });
      try {
        const res = await axios.get<{ available: boolean; message: string }>(`${API_URL}/community/check-handle`, {
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
      setEditBio(profileRes.data.bio || '');
      setEditHandle(profileRes.data.handle || '');
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPosts();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) return openAuthModal();
    if (!profile) return;
    try {
      await axios.post(`${API_URL}/community/users/${profile.id}/follow`);
      setProfile((prev) => prev ? { ...prev, isFollowing: !prev.isFollowing, followersCount: (prev.followersCount || 0) + (prev.isFollowing ? -1 : 1) } : null);
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await axios.patch<UserProfileData>(`${API_URL}/community/profile`, {
        name: editName,
        bio: editBio,
        handle: editHandle,
      });
      setProfile(res.data);
      setIsEditing(false);
      showToast('Profile updated!', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) return null;

  return (
    <div className="donation-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="donation-modal-card card profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-top-bar">
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        {isEditing ? (
          <UserProfileEditForm
            editName={editName}
            setEditName={setEditName}
            editHandle={editHandle}
            setEditHandle={setEditHandle}
            handleStatus={handleStatus}
            editBio={editBio}
            setEditBio={setEditBio}
            isSaving={isSaving}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <UserProfileHeader
            profile={profile}
            isSelf={isSelf}
            isFollowing={profile.isFollowing || false}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onEdit={() => setIsEditing(true)}
            onFollowToggle={handleFollowToggle}
            onOpenMessage={() => onOpenMessage(profile)}
            onOpenReport={() => onOpenReport(profile)}
            onBookService={() => setBookingProvider({
              id: profile.id,
              name: profile.name,
              type: (profile.role as any) || 'veterinarian',
              avatar: profile.avatar,
              badgeType: profile.verificationBadge,
            })}
          />
        )}

        <UserProfilePostsGrid
          posts={posts}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        <UniversalBookingModal
          isOpen={!!bookingProvider}
          onClose={() => setBookingProvider(null)}
          provider={bookingProvider}
        />
      </div>
    </div>
  );
};
