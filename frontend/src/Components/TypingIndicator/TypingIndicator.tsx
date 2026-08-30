import './TypingIndicator.css';

export const TypingIndicator = () => {
  return (
    <div className="typing-indicator" id="typing-indicator">
      <div className="typing-indicator__avatar">
        <span>🐾</span>
      </div>
      <div className="typing-indicator__dots">
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
      </div>
    </div>
  );
};
