import { Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChatMessage } from '../../schemas';
import './ChatBubble.css';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';
  const pet = message.petCreated;

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

        {pet && (
          <div className="chat-pet-passport-card animate-scale-up">
            <div className="chat-pet-card__header">
              <div className="chat-pet-card__title">
                <span className="chat-pet-card__icon">🐾</span>
                <div>
                  <h4>{pet.name}</h4>
                  <p>{pet.breed || 'Companion'} • {pet.species || 'pet'}</p>
                </div>
              </div>
              <span className="chat-pet-card__badge">
                <ShieldCheck size={14} /> Official Passport
              </span>
            </div>

            <div className="chat-pet-card__meta">
              {pet.age !== undefined && (
                <span className="chat-pet-chip">🎂 {pet.age} {pet.age === 1 ? 'year' : 'years'}</span>
              )}
              {pet.weight && (
                <span className="chat-pet-chip">⚖️ {pet.weight} kg</span>
              )}
              {pet.petId && (
                <span className="chat-pet-chip code">🏷️ {pet.petId}</span>
              )}
            </div>

            <div className="chat-pet-card__footer">
              <span className="chat-pet-status">
                <Heart size={14} color="#f97316" /> Registered in Atlas
              </span>
              <Link to="/profile" className="btn-view-passport">
                View Passport <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
