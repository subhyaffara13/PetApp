import type { PetProfile } from '../../schemas';
import './ChatGreeting.css';

interface ChatGreetingProps {
  pets?: PetProfile[];
  onSelectSuggestion: (prompt: string) => void;
}

export const ChatGreeting = ({ pets = [], onSelectSuggestion }: ChatGreetingProps) => {
  const activePet = pets[0];

  const dynamicSuggestions = activePet
    ? [
        {
          text: `What is the optimal daily nutrition and portion size for ${activePet.name}, my ${activePet.age ? `${activePet.age} year old ` : ''}${activePet.breed}?`,
          label: `🦴 Nutrition & diet plan for ${activePet.name} (${activePet.breed})`,
        },
        {
          text: `What are common health symptoms or allergies I should watch for in a ${activePet.breed}?`,
          label: `🩺 Health & wellness check for ${activePet.breed}`,
        },
        {
          text: `What positive reinforcement training works best for ${activePet.name}?`,
          label: `🐕 Behavior & training tips for ${activePet.name}`,
        },
      ]
    : [
        { text: 'What are safe chew toys and healthy treats for a puppy or dog?', label: '🦴 Safe treats & chew toys' },
        { text: 'How can I smoothly transition my cat or kitten to a new diet?', label: '🐟 Smooth food transition tips' },
        { text: 'What routine vaccination schedule is recommended for a pet?', label: '🩺 Essential vaccination timeline' },
      ];

  return (
    <div className="chat-greeting-container animate-fade-in">
      <h1 className="chat-greeting-title">
        <span className="greeting-gradient">
          {activePet ? `Hello! Caring for ${activePet.name}?` : 'Hello, Pet Parent.'}
        </span>
      </h1>
      <p className="chat-greeting-subtitle">
        {activePet
          ? `Ask me any medical, dietary, or behavioral question tailored for ${activePet.name} (${activePet.breed}).`
          : 'How can I assist you with your pet’s health, diet, and wellness today?'}
      </p>

      <div className="chat-suggestions">
        {dynamicSuggestions.map((s, idx) => (
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
