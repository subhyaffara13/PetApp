import './ChatGreeting.css';

interface ChatGreetingProps {
  onSelectSuggestion: (prompt: string) => void;
}

const SUGGESTIONS = [
  { text: 'What are safe chew toys for a puppy?', label: '🦴 Safe toys for heavy chewers' },
  { text: 'How can I help my cat transition to a new wet food diet?', label: '🐟 Switching cat food' },
  { text: 'My dog is barking at the door, what should I do?', label: '🐕 Stop barking at the door' },
];

export const ChatGreeting = ({ onSelectSuggestion }: ChatGreetingProps) => {
  return (
    <div className="chat-greeting-container animate-fade-in">
      <h1 className="chat-greeting-title">
        <span className="greeting-gradient">Hello, Pet Owner.</span>
      </h1>
      <p className="chat-greeting-subtitle">How can I help your pet today?</p>

      <div className="chat-suggestions">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            className="chat-suggestion-chip"
            onClick={() => onSelectSuggestion(s.text)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};
