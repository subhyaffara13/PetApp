import type { ChatThread } from '../../schemas';
import { Plus, MessageSquare, Trash2, PhoneCall, ShieldAlert, X } from 'lucide-react';
import './ChatSidebar.css';

interface ChatSidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onDeleteThread: (threadId: string, e: React.MouseEvent) => void;
  onOpenHotlines: () => void;
  onNavigateEmergency: () => void;
}

export const ChatSidebar = ({
  isOpen,
  onCloseMobile,
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  onOpenHotlines,
  onNavigateEmergency,
}: ChatSidebarProps) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="chat-sidebar-backdrop"
          onClick={onCloseMobile}
          id="chat-sidebar-backdrop"
        />
      )}

      <aside
        className={`chat-sidebar ${isOpen ? 'chat-sidebar--open' : 'chat-sidebar--closed'}`}
        id="chat-sidebar"
      >
        {/* Top Header & New Chat Button */}
        <div className="chat-sidebar__top">
          <button
            type="button"
            className="btn-new-chat"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            id="new-chat-btn"
          >
            <Plus size={18} />
            <span>New chat</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm chat-sidebar-close-mobile"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Threads Section */}
        <div className="chat-sidebar__section">
          <span className="chat-sidebar__label">Recent Chats</span>
          {threads.length === 0 ? (
            <div className="chat-sidebar__empty">
              <MessageSquare size={16} />
              <span>No conversations yet</span>
            </div>
          ) : (
            <div className="chat-sidebar__list">
              {threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <div
                    key={thread.id}
                    className={`chat-sidebar__item ${isActive ? 'chat-sidebar__item--active' : ''}`}
                    onClick={() => {
                      onSelectThread(thread.id);
                      onCloseMobile();
                    }}
                    id={`chat-thread-${thread.id}`}
                  >
                    <MessageSquare size={15} className="chat-thread-icon" />
                    <span className="chat-thread-title" title={thread.title}>
                      {thread.title}
                    </span>
                    <button
                      type="button"
                      className="chat-thread-delete-btn"
                      onClick={(e) => onDeleteThread(thread.id, e)}
                      title="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Shortcut Links */}
        <div className="chat-sidebar__footer">
          <button
            type="button"
            className="chat-sidebar__footer-btn"
            onClick={() => {
              onOpenHotlines();
              onCloseMobile();
            }}
          >
            <PhoneCall size={15} />
            <span>Israel Vet Hotlines</span>
          </button>

          <button
            type="button"
            className="chat-sidebar__footer-btn chat-sidebar__footer-btn--emergency"
            onClick={() => {
              onNavigateEmergency();
              onCloseMobile();
            }}
          >
            <ShieldAlert size={15} />
            <span>Emergency Vet Map</span>
          </button>
        </div>
      </aside>
    </>
  );
};
