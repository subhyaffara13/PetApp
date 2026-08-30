import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';
import type { StoryItem } from '../../../schemas';

interface StoriesTraySectionProps {
  stories: StoryItem[];
  onOpenAddStory: () => void;
  onSelectStory: (index: number) => void;
}

function getStoryTimeRemaining(story: StoryItem) {
  const isLostSos = story.type === 'lost_pet_sos';
  if (!story.expiresAt) {
    return { label: isLostSos ? '30d left' : '24h left', isUrgent: false, isLostSos };
  }

  const diffMs = new Date(story.expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return { label: 'Expired', isUrgent: true, isLostSos };

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return { label: `${days}d left`, isUrgent: false, isLostSos };
  }
  if (hours >= 1) {
    return { label: `${hours}h left`, isUrgent: hours <= 3, isLostSos };
  }
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  return { label: `${mins}m left`, isUrgent: true, isLostSos };
}

export const StoriesTraySection: React.FC<StoriesTraySectionProps> = ({
  stories,
  onOpenAddStory,
  onSelectStory,
}) => {
  const { t } = useTranslation();
  const storiesScrollRef = useRef<HTMLDivElement>(null);

  const slideStories = (direction: 'left' | 'right') => {
    if (storiesScrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      storiesScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="stories-tray-section">
      <div className="stories-slider-wrapper">
        <button className="stories-arrow-btn stories-arrow-btn--left" onClick={() => slideStories('left')} aria-label="Slide stories left">
          <ChevronLeft size={16} />
        </button>

        <div className="stories-scroll" ref={storiesScrollRef}>
          <div className="story-item story-item--add" onClick={onOpenAddStory}>
            <div className="story-avatar-wrap story-avatar-wrap--add">
              <img
                src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&auto=format&fit=crop&q=80"
                alt="My Pet"
                className="story-avatar-img"
              />
              <span className="story-plus-badge">+</span>
            </div>
            <span className="story-name">{t('community.add_story', 'Add Story')}</span>
            <span className="story-timer-pill story-timer-pill--create">{t('community.expire_24h', '24h Expire')}</span>
          </div>

          {stories.map((s, idx) => {
            const timer = getStoryTimeRemaining(s);

            return (
              <div
                key={s._id}
                className={`story-item ${s.type === 'lost_pet_sos' ? 'story-item--sos' : ''} ${s.type === 'hazard_alert' ? 'story-item--hazard' : ''}`}
                onClick={() => onSelectStory(idx)}
              >
                <div className={`story-avatar-wrap story-avatar-wrap--${s.type}`}>
                  <img src={s.petAvatar} alt={s.petName} className="story-avatar-img" />
                  {s.type === 'lost_pet_sos' && <span className="story-type-badge">🚨 SOS</span>}
                  {s.type === 'hazard_alert' && <span className="story-type-badge">⚠️</span>}
                  {((s as any).authorBadge === 'vet' || s.type === 'vet_tip') && <span className="story-type-badge" style={{ background: '#0284c7' }}>🏥 VET</span>}
                  {((s as any).authorBadge === 'merchant' || s.type === 'store_promo') && <span className="story-type-badge" style={{ background: '#d97706' }}>🏪 STORE</span>}
                </div>
                <span className="story-name">{s.petName}</span>

                <span className={`story-timer-pill ${timer.isLostSos ? 'story-timer-pill--sos' : timer.isUrgent ? 'story-timer-pill--urgent' : ''}`}>
                  <Clock size={9} /> {timer.label}
                </span>
              </div>
            );
          })}
        </div>

        <button className="stories-arrow-btn stories-arrow-btn--right" onClick={() => slideStories('right')} aria-label="Slide stories right">
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
};
