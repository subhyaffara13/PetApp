import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChatInput, type ChatAttachment } from '../../Components/ChatInput/ChatInput';
import { ChatSidebar } from '../../Components/ChatSidebar/ChatSidebar';
import { ChatHeader } from '../../Components/ChatHeader/ChatHeader';
import { VetHotlinesModal } from '../../Components/VetHotlinesModal/VetHotlinesModal';
import { ChatMessagesView } from './Components/ChatMessagesView';
import { useChatThreads } from './Hooks/useChatThreads';
import type { ChatMessage, PetProfile } from '../../schemas';
import { API_URL } from '../../config/api';
import './ChatPage.css';

export const ChatPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userPets, setUserPets] = useState<PetProfile[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [showHotlinesModal, setShowHotlinesModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    threads,
    setThreads,
    activeThreadId,
    setActiveThreadId,
    handleNewChat,
    handleDeleteThread,
  } = useChatThreads();

  useEffect(() => {
    axios.get<PetProfile[]>(`${API_URL}/pet-profile`)
      .then((res) => { if (res.data?.length > 0) setUserPets(res.data); })
      .catch(() => {});
  }, []);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThread ? activeThread.messages : [];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, emergencyTriggered]);

  const handleSendMessage = async (text: string, attachment?: ChatAttachment) => {
    let currentThreadId = activeThreadId;
    if (!currentThreadId) currentThreadId = handleNewChat();

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      ...(attachment ? { fileUrl: attachment.url, fileName: attachment.name, fileType: attachment.type } : {}),
    };

    setThreads((prev) =>
      prev.map((t) => (t.id === currentThreadId ? { ...t, updatedAt: Date.now(), messages: [...t.messages, userMsg], title: t.title === 'New Chat' ? text.slice(0, 24) + '...' : t.title } : t))
    );
    setIsTyping(true);

    try {
      const petContext = userPets.length > 0 ? userPets.map((p) => `${p.name} (${p.species}, ${p.breed}, ${p.age}y)`).join('; ') : undefined;
      const res = await axios.post(`${API_URL}/chat`, { message: text, history: messages, petContext });
      const botMsg: ChatMessage = { id: `bot-${Date.now()}`, role: 'assistant', content: res.data.reply, timestamp: Date.now(), isEmergency: res.data.isEmergency };
      if (res.data.isEmergency) { setEmergencyTriggered(true); setEmergencyMessage(text); }
      setThreads((prev) => prev.map((t) => (t.id === currentThreadId ? { ...t, updatedAt: Date.now(), messages: [...t.messages, botMsg] } : t)));
    } catch {
      const fallback: ChatMessage = { id: `err-${Date.now()}`, role: 'assistant', content: "I'm having trouble connecting to PetSOS AI right now. Please seek a vet if urgent.", timestamp: Date.now() };
      setThreads((prev) => prev.map((t) => (t.id === currentThreadId ? { ...t, updatedAt: Date.now(), messages: [...t.messages, fallback] } : t)));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-page page" id="chat-page">
      <ChatSidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => { setActiveThreadId(id); setEmergencyTriggered(false); }}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        onOpenHotlines={() => setShowHotlinesModal(true)}
        onNavigateEmergency={() => navigate('/emergency')}
      />

      <div className="chat-main">
        <ChatHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenHotlines={() => setShowHotlinesModal(true)}
        />

        <ChatMessagesView
          messages={messages}
          isTyping={isTyping}
          emergencyTriggered={emergencyTriggered}
          emergencyMessage={emergencyMessage}
          userPets={userPets}
          scrollRef={scrollRef}
          onSendPreset={(t) => handleSendMessage(t)}
        />

        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
      </div>

      <VetHotlinesModal isOpen={showHotlinesModal} onClose={() => setShowHotlinesModal(false)} />
    </div>
  );
};
