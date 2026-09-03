import React from 'react';
import { Phone } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';
import type { StoryItem } from '../../../schemas';

interface StoryViewerModalProps {
  story: StoryItem | null;
  onClose: () => void;
  onOpenUserProfile?: (userId: string, userName?: string, userAvatar?: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  onClose,
  onOpenUserProfile,
}) => {
  const { t } = useTranslation();
  if (!story) return null;

  return (
    <div className="story-viewer-overlay animate-fade-in" onClick={onClose}>
      <div className="story-viewer-card card" onClick={(e) => e.stopPropagation()}>
        <img
          src={story.mediaUrl || story.petAvatar}
          alt={story.petName}
          className="story-viewer-bg-img"
        />
        <div className="story-viewer-header">
          <div
            className="story-viewer-author"
            onClick={() => {
              if (onOpenUserProfile) {
                onOpenUserProfile((story as any).authorId || 'current-user', story.petName, story.petAvatar);
                onClose();
              }
            }}
            style={{ cursor: onOpenUserProfile ? 'pointer' : 'default' }}
            title="View user profile"
          >
            <img
              src={story.petAvatar}
              alt={story.petName}
              className="story-viewer-author-img"
            />
            <div>
              <h4>{story.petName}</h4>
              <span>{story.locationName || 'Haifa'}</span>
            </div>
          </div>
          <button className="btn-close-story" onClick={onClose}>✕</button>
        </div>

        <div className="story-viewer-footer">
          <p className="story-viewer-caption">{story.caption}</p>
          {story.type === 'lost_pet_sos' && story.contactPhone && (
            <div className="story-sos-action-bar">
              <a href={`tel:${story.contactPhone}`} className="btn-story-call">
                <Phone size={16} /> {t('community.call_owner', 'Call Owner Immediately')} ({story.contactPhone})
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
