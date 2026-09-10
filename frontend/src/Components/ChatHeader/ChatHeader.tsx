import { Menu, PhoneCall, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import './ChatHeader.css';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  onOpenHotlines: () => void;
  onOpenMemoryModal?: () => void;
  isMemoryActive?: boolean;
}

export const ChatHeader = ({
  onToggleSidebar,
  onOpenHotlines,
  onOpenMemoryModal,
  isMemoryActive,
}: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="chat-canvas__header">
      <div className="chat-canvas__header-left">
        <button
          type="button"
          className="btn btn-ghost btn-icon chat-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          title="Toggle sidebar"
          id="sidebar-toggle-btn"
        >
          <Menu size={20} />
        </button>
        <span className="chat-canvas__model-badge">
          PetSOS AI <span className="model-version">3.6 Flash</span>
        </span>
        {isMemoryActive && (
          <button
            type="button"
            className="chat-canvas__memory-badge"
            onClick={onOpenMemoryModal}
            title="Atlas AI Pet Memory Active - click to view learned preferences"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 600,
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              color: '#c084fc',
              cursor: onOpenMemoryModal ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🧠</span>
            <span>Pet AI Memory</span>
          </button>
        )}
      </div>

      <div className="chat-canvas__header-right">
        <ThemeToggle size={16} className="chat-header-theme-btn" />

        <button
          type="button"
          className="btn btn-ghost btn-sm chat-header-btn"
          onClick={onOpenHotlines}
        >
          <PhoneCall size={14} /> Vet Hotlines
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm chat-header-btn chat-header-btn--emergency"
          onClick={() => navigate('/')}
        >
          <ShieldAlert size={14} /> Emergency Map
        </button>
      </div>
    </header>
  );
};
