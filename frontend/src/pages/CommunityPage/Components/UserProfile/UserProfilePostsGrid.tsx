import React from 'react';
import { Grid, List, Heart, MessageCircle } from 'lucide-react';
import type { PostItem } from '../../../../schemas';

interface UserProfilePostsGridProps {
  posts: PostItem[];
  activeView: 'grid' | 'feed';
  setActiveView: (view: 'grid' | 'feed') => void;
}

export const UserProfilePostsGrid: React.FC<UserProfilePostsGridProps> = ({
  posts,
  activeView,
  setActiveView,
}) => {
  return (
    <div className="profile-posts-section">
      <div className="posts-view-toggle">
        <button
          type="button"
          className={`toggle-btn ${activeView === 'grid' ? 'active' : ''}`}
          onClick={() => setActiveView('grid')}
        >
          <Grid size={16} /> Grid
        </button>
        <button
          type="button"
          className={`toggle-btn ${activeView === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveView('feed')}
        >
          <List size={16} /> Feed
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts-card">
          <p>No community posts shared yet.</p>
        </div>
      ) : activeView === 'grid' ? (
        <div className="profile-grid-layout">
          {posts.map((post) => (
            <div key={post._id} className="grid-post-tile">
              {post.mediaUrl ? (
                <img src={post.mediaUrl} alt="post" className="grid-post-image" />
              ) : (
                <div className="grid-post-text-tile">{post.caption}</div>
              )}
              <div className="grid-tile-overlay">
                <span>
                  <Heart size={14} fill="#fff" /> {post.likesCount || 0}
                </span>
                <span>
                  <MessageCircle size={14} /> {post.comments?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="profile-feed-layout">
          {posts.map((post) => (
            <div key={post._id} className="profile-feed-item card">
              <p className="feed-item-content">{post.caption}</p>
              {post.mediaUrl && (
                <img src={post.mediaUrl} alt="attachment" className="feed-item-image" />
              )}
              <div className="feed-item-meta">
                <span>❤️ {post.likesCount || 0} likes</span>
                <span>💬 {post.comments?.length || 0} comments</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
