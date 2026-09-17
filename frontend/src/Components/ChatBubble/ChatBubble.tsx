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

        {!pet && message.petDraft && (
          <div className="chat-pet-draft-card animate-scale-up">
            <div className="chat-pet-draft__header">
              <div className="chat-pet-draft__title">
                <span className="chat-pet-draft__pulse">⏳</span>
                <div>
                  <h4>{message.petDraft.name ? `Setting up ${message.petDraft.name}'s Passport` : 'Setting up Pet Passport'}</h4>
                  <p>Filling out fields conversationally...</p>
                </div>
              </div>
              <span className="chat-pet-draft__pill">In Progress</span>
            </div>

            <div className="chat-pet-draft__fields">
              <div className={`draft-field-item ${message.petDraft.name ? 'is-filled' : 'is-pending'}`}>
                <span className="field-label">Name</span>
                <span className="field-value">{message.petDraft.name || 'Asking...'}</span>
              </div>
              <div className={`draft-field-item ${message.petDraft.species ? 'is-filled' : 'is-pending'}`}>
                <span className="field-label">Species</span>
                <span className="field-value">{message.petDraft.species ? message.petDraft.species : 'Asking...'}</span>
              </div>
              <div className={`draft-field-item ${message.petDraft.breed && message.petDraft.breed !== 'Mixed' && message.petDraft.breed !== 'Mixed Breed' ? 'is-filled' : 'is-pending'}`}>
                <span className="field-label">Breed</span>
                <span className="field-value">{message.petDraft.breed && message.petDraft.breed !== 'Mixed' && message.petDraft.breed !== 'Mixed Breed' ? message.petDraft.breed : 'Asking...'}</span>
              </div>
              <div className={`draft-field-item ${message.petDraft.age !== undefined && message.petDraft.age !== null ? 'is-filled' : 'is-pending'}`}>
                <span className="field-label">Age</span>
                <span className="field-value">{message.petDraft.age !== undefined && message.petDraft.age !== null ? `${message.petDraft.age} ${message.petDraft.age === 1 ? 'yr' : 'yrs'}` : 'Asking...'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
