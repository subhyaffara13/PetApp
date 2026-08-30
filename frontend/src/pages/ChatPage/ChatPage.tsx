import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChatBubble } from '../../Components/ChatBubble/ChatBubble';
import { TypingIndicator } from '../../Components/TypingIndicator/TypingIndicator';
import { EmergencyCard } from '../../Components/EmergencyCard/EmergencyCard';
import { ChatInput, type ChatAttachment } from '../../Components/ChatInput/ChatInput';
import { ChatSidebar } from '../../Components/ChatSidebar/ChatSidebar';
import { ChatHeader } from '../../Components/ChatHeader/ChatHeader';
import { ChatGreeting } from '../../Components/ChatGreeting/ChatGreeting';
import { VetHotlinesModal } from '../../Components/VetHotlinesModal/VetHotlinesModal';
import { Sparkles } from 'lucide-react';
import type { ChatMessage, ChatThread } from '../../schemas';
import './ChatPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const THREADS_STORAGE_KEY = 'petsos_chat_threads_v2';

export const ChatPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load threads from localStorage
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem(THREADS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(() => {
    return threads.length > 0 ? threads[0].id : null;
  });

  const [isTyping, setIsTyping] = useState(false);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [showHotlinesModal, setShowHotlinesModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync threads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
    } catch {}
  }, [threads]);

  // Current active thread messages
  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messages = activeThread ? activeThread.messages : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, emergencyTriggered]);

  const handleNewChat = () => {
    const newThreadId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newThreadId,
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
    setEmergencyTriggered(false);
  };

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setEmergencyTriggered(false);
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (activeThreadId === threadId) {
      const remaining = threads.filter((t) => t.id !== threadId);
      setActiveThreadId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleSend = async (
    text: string,
    attachment?: ChatAttachment
  ) => {
    if (emergencyTriggered) return;

    let contentToSend = text;
    if (attachment) {
      contentToSend += `\n[Attached File: ${attachment.name}]`;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: contentToSend,
      timestamp: Date.now(),
    };

    let currentThreadId = activeThreadId;

    if (!currentThreadId || !threads.some((t) => t.id === currentThreadId)) {
      currentThreadId = `thread-${Date.now()}`;
      const generatedTitle = text.slice(0, 28) + (text.length > 28 ? '...' : '');
      const newThread: ChatThread = {
        id: currentThreadId,
        title: generatedTitle || 'Pet Advice Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMsg],
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(currentThreadId);
    } else {
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === currentThreadId) {
            const isFirst = t.messages.length === 0;
            const generatedTitle = isFirst ? text.slice(0, 28) + (text.length > 28 ? '...' : '') : t.title;
            return {
              ...t,
              title: generatedTitle,
              updatedAt: Date.now(),
              messages: [...t.messages, userMsg],
            };
          }
          return t;
        })
      );
    }

    setIsTyping(true);

    try {
      const currentMessages = activeThread ? activeThread.messages : [];
      const imagePayload = attachment?.base64
        ? { data: attachment.base64, mimeType: attachment.mimeType || 'image/jpeg' }
        : undefined;

      const response = await axios.post(`${API_URL}/chat/message`, {
        message: text || (attachment ? 'Analyze this uploaded pet image or document' : ''),
        history: currentMessages.map((m) => ({ role: m.role, content: m.content })),
        image: imagePayload,
      });

      const data = response.data;

      if (data.emergency) {
        setEmergencyTriggered(true);
        setEmergencyMessage(data.message || '');
      } else {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: Date.now(),
        };

        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === currentThreadId) {
              return {
                ...t,
                updatedAt: Date.now(),
                messages: [...t.messages, botMsg],
              };
            }
            return t;
          })
        );
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble connecting right now. For any urgent concerns, please contact your veterinarian directly.",
        timestamp: Date.now(),
      };
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === currentThreadId) {
            return {
              ...t,
              updatedAt: Date.now(),
              messages: [...t.messages, errorMsg],
            };
          }
          return t;
        })
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-layout-wrapper" id="chat-page">
      {/* Left Collapsible Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        onOpenHotlines={() => setShowHotlinesModal(true)}
        onNavigateEmergency={() => navigate('/')}
      />

      {/* Main Gemini Chat Canvas */}
      <main className="chat-main-canvas">
        {/* Top Gemini Header Bar */}
        <ChatHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenHotlines={() => setShowHotlinesModal(true)}
        />

        {/* Messages / Greeting Canvas */}
        <div className="chat-page__messages" ref={scrollRef}>
          {messages.length === 0 && !isTyping && (
            <ChatGreeting onSelectSuggestion={handleSend} />
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="chat-message-container">
              <ChatBubble message={msg} />
            </div>
          ))}
          {isTyping && (
            <div className="chat-message-container">
              <TypingIndicator />
            </div>
          )}
          {emergencyTriggered && (
            <div className="chat-message-container">
              <EmergencyCard message={emergencyMessage} />
            </div>
          )}
        </div>

        {/* Input Pill */}
        <ChatInput onSend={handleSend} disabled={emergencyTriggered || isTyping} />

        {/* Gemini Disclaimer */}
        <div className="chat-disclaimer">
          <Sparkles size={11} className="inline-sparkle" /> PetSOS AI can make mistakes. Check important medical info with your vet.
        </div>
      </main>

      {/* Vet Hotlines Modal */}
      <VetHotlinesModal
        isOpen={showHotlinesModal}
        onClose={() => setShowHotlinesModal(false)}
      />
    </div>
  );
};
