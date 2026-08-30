import React from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  UserPlus,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import type { PostItem, PostComment } from '../../../schemas';

interface PostCardItemProps {
  post: PostItem;
  commentInput: string;
  isExpandedComments: boolean;
  isTranslated: boolean;
  onToggleLike: (id: string) => void;
  onToggleFollow: (authorId: string, authorName: string) => void;
  onDeletePost: (id: string) => void;
  onAddComment: (id: string) => void;
  onCommentInputChange: (id: string, text: string) => void;
  onToggleExpandComments: (id: string) => void;
  onToggleTranslate: (id: string) => void;
}

export const PostCardItem: React.FC<PostCardItemProps> = ({
  post,
  commentInput,
  isExpandedComments,
  isTranslated,
  onToggleLike,
  onToggleFollow,
  onDeletePost,
  onAddComment,
  onCommentInputChange,
  onToggleExpandComments,
  onToggleTranslate,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const isLiked = post.likedBy?.includes('current-user');
  const isOwnPost = (post as any).authorId === 'current-user' || !post.likedBy;
  const authorName = (post as any).authorName || 'Pet Parent';
  const authorAvatar = (post as any).authorAvatar || post.petAvatar;
  const authorId = (post as any).authorId || 'user-talia';
  const isFollowing = (post as any).isFollowing;

  return (
    <article className="feed-post-card card animate-slide-up" id={`post-${post._id}`}>
      {/* Author & Follow Header */}
      <div className="post-header">
        <div className="post-header-author-row">
          <div className="author-meta-wrap">
            <img src={authorAvatar} alt={authorName} className="author-avatar-img" />
            <div className="author-text-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className="author-main-name">{authorName}</span>
                {((post as any).authorBadge === 'vet' || post.category === 'vet_update' || (post.category === 'health_tip' && (post as any).authorRole === 'clinic_admin')) && (
                  <span style={{ background: '#0284c7', color: '#fff', padding: '1px 6px', borderRadius: 10, fontSize: '0.66rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    🏥 Verified Vet
                  </span>
                )}
                {((post as any).authorBadge === 'merchant' || post.category === 'promo' || (post as any).authorRole === 'store_merchant') && (
                  <span style={{ background: '#d97706', color: '#fff', padding: '1px 6px', borderRadius: 10, fontSize: '0.66rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    🏪 Verified Store
                  </span>
                )}
              </div>
              <span className="author-sub-desc">
                {post.petName} · {post.petBreed || 'Haifa, Israel'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {!isOwnPost && (
              <button
                type="button"
                className={`btn-follow-author ${isFollowing ? 'btn-follow-author--following' : ''}`}
                onClick={() => onToggleFollow(authorId, authorName)}
              >
                {isFollowing ? <><UserCheck size={12} /> Following</> : <><UserPlus size={12} /> Follow</>}
              </button>
            )}
            {isOwnPost && (
              <button
                type="button"
                className="btn-delete-post"
                title="Delete Post"
                onClick={() => onDeletePost(post._id)}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Media Image */}
      <div className="post-media-wrap">
        <img src={post.mediaUrl} alt={post.petName} className="post-image" />
        <span className={`post-category-tag post-category-tag--${post.category}`}>
          {post.category === 'health_tip'
            ? t('community.tag_health', '🩺 HEALTH & CARE')
            : post.category === 'cute'
            ? t('community.tag_cute', '✨ CUTE SNAP')
            : post.category === 'playdate'
            ? t('community.tag_playdate', '🐕 PLAYDATE')
            : post.category === 'adoption'
            ? t('community.tag_adoption', '🏡 FOR ADOPTION')
            : t('community.tag_lost', '🚨 LOST SOS')}
        </span>
      </div>

      {/* Action Bar */}
      <div className="post-actions">
        <div className="post-actions-left">
          <button
            className={`btn-icon-action ${isLiked ? 'btn-icon-action--liked' : ''}`}
            onClick={() => onToggleLike(post._id)}
          >
            <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
            <span>{post.likesCount}</span>
          </button>

          <button
            className="btn-icon-action"
            onClick={() => onToggleExpandComments(post._id)}
          >
            <MessageCircle size={20} />
            <span>{post.comments.length}</span>
          </button>

          <button
            className="btn-icon-action"
            onClick={() => {
              navigator.clipboard?.writeText?.(window.location.href);
              showToast('קישור לפוסט הועתק ללוח!', 'success', '🔗 Post Link Copied');
            }}
            title="Share Post"
          >
            <Share2 size={19} />
          </button>

          <button
            type="button"
            className="btn-translate-post"
            onClick={() => onToggleTranslate(post._id)}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            🌐 {isTranslated ? t('community.show_original', 'Show Original') : t('community.translate_btn', 'Translate Post')}
          </button>
        </div>
      </div>

      {/* Caption */}
      <div className="post-caption">
        <strong>{post.petName}</strong> {post.caption}
      </div>

      {post.category === 'adoption' && (
        <div className="adopt-contact-row">
          <span className="adopt-contact-label">🏡 Looking for a forever home</span>
          <a
            className="btn-adopt-contact"
            href={post.contactPhone ? `tel:${post.contactPhone.replace(/\s/g, '')}` : '#'}
            onClick={(e) => {
              if (!post.contactPhone) e.preventDefault();
            }}
          >
            {post.contactPhone ? `📞 Contact ${post.contactPhone}` : '💬 Ask about adoption'}
          </a>
        </div>
      )}

      {/* Real-time Comments Section */}
      <div className="feed-comments-wrap">
        {post.comments.length > 0 && (
          <div className="comments-list">
            {post.comments.slice(isExpandedComments ? 0 : -2).map((c: PostComment, i: number) => (
              <div key={i} className="comment-item-row">
                <img
                  src={(c as any).userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={c.userName}
                  className="comment-item-avatar"
                />
                <div className="comment-item-content">
                  <span className="comment-item-author">{c.userName}</span>
                  <span>{c.text}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {post.comments.length > 2 && !isExpandedComments && (
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0', cursor: 'pointer' }}
            onClick={() => onToggleExpandComments(post._id)}
          >
            View all {post.comments.length} comments...
          </button>
        )}

        {/* Add Comment Input */}
        <div className="comment-input-row">
          <input
            type="text"
            className="comment-text-input"
            placeholder={t('community.comment_placeholder', 'Add a reply or tip...')}
            value={commentInput || ''}
            onChange={(e) => onCommentInputChange(post._id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAddComment(post._id);
            }}
          />
          <button
            type="button"
            className="btn-send-comment"
            onClick={() => onAddComment(post._id)}
            disabled={!commentInput?.trim()}
          >
            <Send size={12} /> Send
          </button>
        </div>
      </div>
    </article>
  );
};
