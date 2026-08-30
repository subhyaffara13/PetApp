import { Menu, PhoneCall, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import './ChatHeader.css';

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  onOpenHotlines: () => void;
}

export const ChatHeader = ({ onToggleSidebar, onOpenHotlines }: ChatHeaderProps) => {
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
