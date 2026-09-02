import React, { type RefObject } from 'react';
import { ChatBubble } from '../../../Components/ChatBubble/ChatBubble';
import { TypingIndicator } from '../../../Components/TypingIndicator/TypingIndicator';
import { EmergencyCard } from '../../../Components/EmergencyCard/EmergencyCard';
import { ChatGreeting } from '../../../Components/ChatGreeting/ChatGreeting';
import type { ChatMessage, PetProfile } from '../../../schemas';

interface ChatMessagesViewProps {
  messages: ChatMessage[];
  isTyping: boolean;
  emergencyTriggered: boolean;
  emergencyMessage: string;
  userPets: PetProfile[];
  scrollRef: RefObject<HTMLDivElement | null>;
  onSendPreset: (text: string) => void;
}

export const ChatMessagesView: React.FC<ChatMessagesViewProps> = ({
  messages,
  isTyping,
  emergencyTriggered,
  emergencyMessage,
  userPets,
  scrollRef,
  onSendPreset,
}) => {
  return (
    <div className="chat-messages" ref={scrollRef}>
      {messages.length === 0 ? (
        <ChatGreeting pets={userPets} onSelectSuggestion={onSendPreset} />
      ) : (
        <>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {isTyping && <TypingIndicator />}

          {emergencyTriggered && (
            <EmergencyCard message={emergencyMessage} />
          )}
        </>
      )}
    </div>
  );
};
