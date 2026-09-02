import { useNavigate } from 'react-router-dom';
import { Sun, Moon, MessageSquareText, Calendar as CalendarIcon } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector';
import { useTranslation } from '../../context/LanguageContext';
import './EmergencyHeader.css';

interface EmergencyHeaderProps {
  totalCount: number;
  verifiedCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenCalendar?: () => void;
}

export const EmergencyHeader = ({
  totalCount,
  verifiedCount,
  theme,
  onToggleTheme,
  onOpenCalendar,
}: EmergencyHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="emergency-header">
      <div className="emergency-header__info">
        <p className="eyebrow">{t('emergency.title', 'Emergency vets')}</p>
        <h1 id="summary" className="summary-title">
          {totalCount} {t('emergency.vets_nearby', 'vets nearby')} · {verifiedCount} 24/7
        </h1>
      </div>

      <div className="emergency-header__actions">
        <LanguageSelector variant="compact" />

        {onOpenCalendar && (
          <button
            type="button"
            className="calendar-fab"
            title="Open Pet Care Schedule"
            aria-label="Open Pet Care Schedule"
            onClick={onOpenCalendar}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '0.6rem',
              padding: '0.45rem',
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarIcon size={18} />
          </button>
        )}

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="chat-fab"
          title="Ask the triage chat"
          aria-label="Open triage chat"
          onClick={() => navigate('/chat')}
        >
          <MessageSquareText size={18} />
        </button>
      </div>
    </header>
  );
};
