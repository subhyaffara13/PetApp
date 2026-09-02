import { useState, useEffect } from 'react';
import type { ChatThread } from '../../../schemas';

const THREADS_STORAGE_KEY = 'petsos_chat_threads_v2';

export function useChatThreads() {
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

  useEffect(() => {
    try {
      localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
    } catch {}
  }, [threads]);

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
    return newThreadId;
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    if (activeThreadId === threadId) {
      const remaining = threads.filter((t) => t.id !== threadId);
      setActiveThreadId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearAllThreads = () => {
    if (window.confirm('Delete all saved conversations?')) {
      setThreads([]);
      setActiveThreadId(null);
    }
  };

  return {
    threads,
    setThreads,
    activeThreadId,
    setActiveThreadId,
    handleNewChat,
    handleDeleteThread,
    handleClearAllThreads,
  };
}
