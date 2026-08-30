import { Sparkles } from 'lucide-react';
import type { ChatMessage } from '../../schemas';
import './ChatBubble.css';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`chat-bubble ${isUser ? 'chat-bubble--user' : 'chat-bubble--bot'}`}
      id={`msg-${message.id}`}
    >
      {!isUser && (
        <div className="chat-bubble__avatar">
          <Sparkles size={18} className="chat-bubble__sparkle" />
        </div>
      )}
      <div className="chat-bubble__content">
        <p className="chat-bubble__text">{message.content}</p>
        {/* Timestamps removed for Gemini-like minimal UI, but could be added on hover later */}
      </div>
    </div>
  );
};
