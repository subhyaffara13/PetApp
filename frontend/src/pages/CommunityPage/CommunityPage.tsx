import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, MessageCircle, Plus } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../../Components/LanguageSelector/LanguageSelector';
import { ThemeToggle } from '../../Components/ThemeToggle/ThemeToggle';
import { SocialProfileBar } from './Components/SocialProfileBar';
import type { UserProfileData } from './Components/SocialProfileBar';
import { StoriesTraySection } from './Components/StoriesTraySection';
import { CategoryFilterSection } from './Components/CategoryFilterSection';
import { PostCardItem } from './Components/PostCardItem';
import { SheltersSection } from './Components/SheltersSection';
import { FriendsModal } from './Components/FriendsModal';
import { NewPostModal } from './Components/NewPostModal';
import { StoryViewerModal } from './Components/StoryViewerModal';
import { UserSearchHeader } from './Components/UserSearchHeader';
import { UserProfileModal } from './Components/UserProfileModal';
import { SuggestedNeighborsTray } from './Components/SuggestedNeighborsTray';
import { DirectMessagesDrawer } from './Components/DirectMessagesDrawer';
import { ReportSafetyModal } from './Components/ReportSafetyModal';
import type { StoryItem, PostItem } from '../../schemas';
import './CommunityPage.css';

import { API_URL } from '../../config/api';
const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80';

export const CommunityPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [commentInput, setCommentInput] = useState<{ [postId: string]: string }>({});
  const [translatedPosts, setTranslatedPosts] = useState<{ [postId: string]: boolean }>({});
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({});

  // Active Modals & Drawers
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);
  const [showMessagesDrawer, setShowMessagesDrawer] = useState(false);
  const [messagePartner, setMessagePartner] = useState<UserProfileData | null>(null);
  const [reportUser, setReportUser] = useState<UserProfileData | null>(null);
  const [reportTranscript, setReportTranscript] = useState<string | undefined>(undefined);

  const [profile, setProfile] = useState<UserProfileData>({
    id: user?.id || 'current-user',
    name: user?.name || 'Subhy Affara',
    handle: user?.email ? `@${user.email.split('@')[0]}` : '@subhyaffara',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Proud pet parent in Haifa 🐾',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
  });

  const [communityUsers, setCommunityUsers] = useState<UserProfileData[]>([]);

  // Fetch Live Database Profile & Data
  const fetchData = async () => {
    try {
      const [storiesRes, postsRes, profileRes] = await Promise.all([
        axios.get<StoryItem[]>(`${API_URL}/community/stories`).catch(() => ({ data: [] })),
        axios.get<PostItem[]>(`${API_URL}/community/feed`).catch(() => ({ data: [] })),
        axios.get<UserProfileData>(`${API_URL}/community/profile`).catch(() => ({ data: null })),
      ]);

      if (storiesRes.data) setStories(storiesRes.data);
      if (postsRes.data) setPosts(postsRes.data);
      if (profileRes.data) setProfile(profileRes.data);
    } catch (err) {
      console.error('Failed to load community data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // New Post Form State
  const [postMode, setPostMode] = useState<'feed' | 'story'>('feed');
  const [selectedPetName, setSelectedPetName] = useState<string>('Rocky');
  const [selectedPetBreed, setSelectedPetBreed] = useState<string>('Golden Retriever · 3 yrs');
  const [newPostImage, setNewPostImage] = useState(SAMPLE_PHOTO);
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostLocation, setNewPostLocation] = useState('Hof HaCarmel Beach, Haifa');
  const [newPostCategory, setNewPostCategory] = useState<'cute' | 'playdate' | 'lost_found' | 'health_tip' | 'adoption'>('cute');
  const [contactPhone, setContactPhone] = useState('+972-54-998-1122');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenShare = (mode: 'feed' | 'story' = 'feed') => {
    if (!isAuthenticated) {
      showToast('Please sign in to share with neighbors', 'info', '🔒 Sign in Required');
      openAuthModal('/community');
      return;
    }
    setPostMode(mode);
    setShowNewPostModal(true);
  };

  const handleOpenMessages = (partner?: UserProfileData) => {
    if (!isAuthenticated) {
      showToast('Please sign in to access direct messages', 'info', '🔒 Sign in Required');
      openAuthModal('/community');
      return;
    }
    setMessagePartner(partner || null);
    setShowMessagesDrawer(true);
  };

  const handleToggleLike = async (postId: string) => {
    if (!isAuthenticated) {
      showToast('Please sign in to like posts', 'info', '🔒 Sign in Required');
      openAuthModal('/community');
      return;
    }

    const currentUserId = user?.id || 'current-user';
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;
        const isLiked = p.likedBy?.includes(currentUserId);
        return {
          ...p,
          likedBy: isLiked ? p.likedBy.filter((id: string) => id !== currentUserId) : [...(p.likedBy || []), currentUserId],
          likesCount: isLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1,
        };
      })
    );

    try {
      await axios.post(`${API_URL}/community/feed/${postId}/like`, { userId: currentUserId });
    } catch {
      showToast('Like failed. Please try again.', 'error', '❌ Like Failed');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!isAuthenticated) {
      showToast('Please sign in to comment', 'info', '🔒 Sign in Required');
      openAuthModal('/community');
      return;
    }

    const text = commentInput[postId]?.trim();
    if (!text) return;

    const newComment = {
      _id: `cmt-${Date.now()}`,
      userName: user?.name || profile.name,
      userAvatar: user?.avatar || profile.avatar,
      text,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => (p._id === postId ? { ...p, comments: [...p.comments, newComment as any] } : p))
    );
    setCommentInput((prev) => ({ ...prev, [postId]: '' }));

    try {
      await axios.post(`${API_URL}/community/feed/${postId}/comments`, {
        userName: user?.name || profile.name,
        userAvatar: user?.avatar || profile.avatar,
        text,
      });
      showToast('Comment added!', 'success', '💬 Comment Added');
    } catch {
      showToast('Failed to add comment.', 'error', '❌ Comment Failed');
    }
  };

  const handleToggleFollow = async (userId: string, userName: string) => {
    if (!isAuthenticated) {
      showToast('Please sign in to follow pet parents', 'info', '🔒 Sign in Required');
      openAuthModal('/community');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/community/users/${userId}/follow`);
      const { isFollowing } = res.data;

      setCommunityUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFollowing, followersCount: res.data.targetUser.followersCount } : u))
      );
      setProfile((prev) => ({ ...prev, followingCount: res.data.currentUser.followingCount }));
      setPosts((prev) => prev.map((p) => ((p as any).authorId === userId ? { ...p, isFollowing } : p)));

      showToast(
        isFollowing ? `Now following ${userName}` : `Unfollowed ${userName}`,
        'info',
        isFollowing ? '👥 Following' : 'Unfollowed'
      );
    } catch {
      showToast('Follow action failed.', 'error', '❌ Follow Failed');
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
    setProfile((prev) => ({ ...prev, postsCount: Math.max(0, prev.postsCount - 1) }));
    try {
      await axios.delete(`${API_URL}/community/feed/${postId}`);
      showToast('Post deleted', 'info', '🗑️ Post Deleted');
    } catch {
      showToast('Failed to delete post.', 'error', '❌ Delete Failed');
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostCaption.trim()) return;

    setIsSubmitting(true);

    if (postMode === 'story') {
      const storyPayload = {
        authorId: user?.id || 'current-user',
        authorName: user?.name || profile.name,
        authorAvatar: user?.avatar || profile.avatar,
        petName: selectedPetName,
        petAvatar: newPostImage,
        mediaUrl: newPostImage,
        caption: newPostCaption,
        type: newPostCategory === 'lost_found' ? 'lost_pet_sos' : 'moment',
        locationName: newPostLocation,
        contactPhone,
      };

      try {
        const res = await axios.post(`${API_URL}/community/stories`, storyPayload);
        setStories((prev) => [res.data, ...prev]);
        showToast('Story published! Active for 24 hours ⚡', 'success', '📸 Story Live');
      } catch {
        showToast('Failed to publish story.', 'error', '❌ Story Failed');
      }
    } else {
      const postPayload = {
        authorId: user?.id || 'current-user',
        authorName: user?.name || profile.name,
        authorAvatar: user?.avatar || profile.avatar,
        petName: selectedPetName,
        petBreed: selectedPetBreed,
        petAvatar: newPostImage,
        mediaUrl: newPostImage,
        caption: newPostCaption,
        locationTag: newPostLocation,
        category: newPostCategory,
        contactPhone,
      };

      try {
        const res = await axios.post(`${API_URL}/community/feed`, postPayload);
        setPosts((prev) => [res.data, ...prev]);
        setProfile((prev) => ({ ...prev, postsCount: prev.postsCount + 1 }));
        showToast('Published to PetSOS Community!', 'success', '🎉 Post Published');
      } catch {
        showToast('Failed to publish post.', 'error', '❌ Publish Failed');
      }
    }

    setIsSubmitting(false);
    setShowNewPostModal(false);
    setNewPostCaption('');
  };

  const filteredPosts = posts.filter((p) => activeCategory === 'all' || p.category === activeCategory);

  return (
    <div className="community-page page" id="community-page">
      {/* Header with Search & Direct Messaging Trigger */}
      <header className="community-header">
        <div className="community-header__top-row">
          <div>
            <h1 className="community-title">{t('community.title', 'Community & Safety')}</h1>
            <p className="community-subtitle">{t('community.subtitle', 'Stories, Amber Alerts & Local Pet Moments')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <LanguageSelector variant="compact" />
            <ThemeToggle className="theme-toggle-btn-page" />
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => handleOpenMessages()}
              title="Encrypted Direct Messages"
              style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8' }}
            >
              <MessageCircle size={18} />
            </button>
            <button className="btn-create-post" onClick={() => handleOpenShare('feed')}>
              <Plus size={16} /> {t('community.share_moment', 'Share Moment')}
            </button>
          </div>
        </div>

        {/* Real-time Typeahead User Search Bar */}
        <UserSearchHeader onSelectUser={(u) => setSelectedUserProfile(u)} />
      </header>

      {/* Main Responsive Grid Layout */}
      <div className="community-grid-layout">
        {/* Main Feed Column */}
        <div className="community-main-column">
          {/* Stories Tray */}
          <StoriesTraySection
            stories={stories}
            onOpenAddStory={() => handleOpenShare('story')}
            onSelectStory={(idx) => setSelectedStoryIndex(idx)}
          />

          {/* Category Filter Section */}
          <CategoryFilterSection
            activeCategory={activeCategory}
            onSelectCategory={(cat) => setActiveCategory(cat)}
          />

          {/* Live Community Feed */}
          <section className="feed-container">
            {filteredPosts.length === 0 ? (
              <div className="feed-empty animate-fade-in">
                <Sparkles size={40} color="var(--color-primary)" />
                <h3>No posts yet</h3>
                <p>Be the first to share a cute moment, health tip, or playdate invitation!</p>
                <button className="btn btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => handleOpenShare('feed')}>
                  + Create Your First Post
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post._id} style={{ position: 'relative' }}>
                  <PostCardItem
                    post={post}
                    commentInput={commentInput[post._id] || ''}
                    isExpandedComments={!!expandedComments[post._id]}
                    isTranslated={!!translatedPosts[post._id]}
                    onToggleLike={() => handleToggleLike(post._id)}
                    onToggleFollow={() => handleToggleFollow((post as any).authorId || 'user-talia', post.petName)}
                    onDeletePost={() => handleDeletePost(post._id)}
                    onAddComment={() => handleAddComment(post._id)}
                    onCommentInputChange={(_id: string, text: string) => setCommentInput((prev) => ({ ...prev, [post._id]: text }))}
                    onToggleExpandComments={() => setExpandedComments((prev) => ({ ...prev, [post._id]: !prev[post._id] }))}
                    onToggleTranslate={() => setTranslatedPosts((prev) => ({ ...prev, [post._id]: !prev[post._id] }))}
                  />
                </div>
              ))
            )}
          </section>
        </div>

        {/* Desktop Sidebar Column */}
        <aside className="community-sidebar-column">
          {/* Profile Bar */}
          <div onClick={() => setSelectedUserProfile(profile)} style={{ cursor: 'pointer', marginBottom: '1.25rem' }}>
            <SocialProfileBar
              profile={profile}
              totalPosts={posts.length}
              onFilterAll={() => setActiveCategory('all')}
              onOpenFriends={() => setShowFriendsModal(true)}
            />
          </div>

          {/* Algorithmic "Suggested for You" Neighbors Tray */}
          <SuggestedNeighborsTray onSelectUser={(u) => setSelectedUserProfile(u)} />

          {/* Shelters & Adoption */}
          <SheltersSection
            activeCategory={activeCategory}
            onGoToAdoption={() => setActiveCategory('adoption')}
            onGoToAll={() => setActiveCategory('all')}
          />
        </aside>
      </div>

      {/* Full Instagram-Style User Profile Modal */}
      {selectedUserProfile && (
        <UserProfileModal
          userId={selectedUserProfile.id}
          onClose={() => setSelectedUserProfile(null)}
          onOpenMessage={(targetUser) => {
            setSelectedUserProfile(null);
            handleOpenMessages(targetUser);
          }}
          onOpenReport={(targetUser) => {
            setSelectedUserProfile(null);
            setReportUser(targetUser);
            setReportTranscript(undefined);
          }}
        />
      )}

      {/* Encrypted Direct Messages Drawer */}
      <DirectMessagesDrawer
        isOpen={showMessagesDrawer}
        onClose={() => setShowMessagesDrawer(false)}
        initialPartner={messagePartner}
        onOpenReport={(targetUser, transcript) => {
          setReportUser(targetUser);
          setReportTranscript(transcript);
        }}
      />

      {/* Harassment & Abuse Reporting Modal */}
      {reportUser && (
        <ReportSafetyModal
          reportedUser={reportUser}
          chatTranscriptSnippet={reportTranscript}
          onClose={() => { setReportUser(null); setReportTranscript(undefined); }}
        />
      )}

      {/* Modals */}
      {selectedStoryIndex !== null && (
        <StoryViewerModal
          story={selectedStoryIndex !== null ? stories[selectedStoryIndex] : null}
          onClose={() => setSelectedStoryIndex(null)}
        />
      )}

      <NewPostModal
        isOpen={showNewPostModal}
        postMode={postMode}
        setPostMode={setPostMode}
        selectedPetName={selectedPetName}
        setSelectedPetName={setSelectedPetName}
        selectedPetBreed={selectedPetBreed}
        setSelectedPetBreed={setSelectedPetBreed}
        newPostImage={newPostImage}
        setNewPostImage={setNewPostImage}
        newPostCaption={newPostCaption}
        setNewPostCaption={setNewPostCaption}
        newPostLocation={newPostLocation}
        setNewPostLocation={setNewPostLocation}
        newPostCategory={newPostCategory}
        setNewPostCategory={setNewPostCategory}
        contactPhone={contactPhone}
        setContactPhone={setContactPhone}
        isSubmitting={isSubmitting}
        onClose={() => setShowNewPostModal(false)}
        onSubmit={handlePublish}
      />

      <FriendsModal
        isOpen={showFriendsModal}
        users={communityUsers}
        onClose={() => setShowFriendsModal(false)}
        onToggleFollow={(id: string, name: string) => handleToggleFollow(id, name)}
      />
    </div>
  );
};
