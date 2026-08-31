import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, Lock, ShieldAlert, Image as ImageIcon, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useImageUpload } from '../../../Hooks/useImageUpload';
import { encryptMessage, decryptMessage } from '../../../utils/cryptoUtils';
import type { UserProfileData } from './SocialProfileBar';

import { API_URL } from '../../../config/api';

interface MessageItem {
  _id: string;
  senderId: string;
  recipientId: string;
  senderName: string;
  senderAvatar: string;
  recipientName: string;
  recipientAvatar: string;
  encryptedPayload: string;
  iv: string;
  mediaUrl?: string;
  createdAt: string;
  decryptedText?: string;
}

interface DirectMessagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPartner?: UserProfileData | null;
  onOpenReport: (targetUser: UserProfileData, chatTranscriptSnippet?: string) => void;
}

export const DirectMessagesDrawer: React.FC<DirectMessagesDrawerProps> = ({
  isOpen,
  onClose,
  initialPartner,
  onOpenReport,
}) => {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const { image, isUploading, handleFileChange, clearImage } = useImageUpload('posts');

  const [activePartner, setActivePartner] = useState<UserProfileData | null>(initialPartner || null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeImageUrl = image?.url || image?.previewUrl || '';

  useEffect(() => {
    if (initialPartner) {
      setActivePartner(initialPartner);
    }
  }, [initialPartner]);

  // Load active conversations list
  const fetchConversations = async () => {
    if (!authUser) return;
    try {
      const res = await axios.get(`${API_URL}/community/messages/conversations`);
      setConversations(res.data || []);
    } catch {}
  };

  // Load and decrypt messages for active conversation
  const fetchAndDecryptMessages = async () => {
    if (!authUser || !activePartner) return;
    try {
      const res = await axios.get<MessageItem[]>(`${API_URL}/community/messages/${activePartner.id}`);
      const rawMessages = res.data || [];

      const decrypted = await Promise.all(
        rawMessages.map(async (m) => {
          const text = await decryptMessage(m.encryptedPayload, m.iv, m.senderId, m.recipientId);
          return { ...m, decryptedText: text };
        })
      );

      setMessages(decrypted);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
      if (activePartner) {
        fetchAndDecryptMessages();
      }
    }
  }, [isOpen, activePartner]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !activeImageUrl) || !authUser || !activePartner || isSending) return;

    setIsSending(true);
    const plain = inputText.trim() || '📷 Photo';

    try {
      // 1. Client-Side E2EE Encryption
      const { encryptedPayload, iv } = await encryptMessage(plain, authUser.id, activePartner.id);

      const payload = {
        senderId: authUser.id,
        recipientId: activePartner.id,
        senderName: authUser.name,
        senderAvatar: authUser.avatar || '',
        recipientName: activePartner.name,
        recipientAvatar: activePartner.avatar || '',
        encryptedPayload,
        iv,
        mediaUrl: activeImageUrl,
      };

      const res = await axios.post(`${API_URL}/community/messages`, payload);
      const newMsg: MessageItem = {
        ...res.data,
        decryptedText: plain,
      };

      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
      clearImage();
    } catch (err) {
      showToast('Failed to send encrypted message.', 'error', '❌ Delivery Error');
    } finally {
      setIsSending(false);
    }
  };

  const getChatTranscriptSnippet = (): string => {
    return messages
      .slice(-15)
      .map((m) => `[${new Date(m.createdAt).toLocaleTimeString()}] ${m.senderName}: ${m.decryptedText || '[Media]'}`)
      .join('\n');
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="auth-modal card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          height: '85vh',
          maxHeight: 680,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 18,
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(15,23,42,0.85)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {activePartner ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setActivePartner(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              >
                <ArrowLeft size={18} />
              </button>
              <img
                src={activePartner.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt=""
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <strong style={{ color: '#f8fafc', fontSize: '0.88rem', display: 'block' }}>{activePartner.name}</strong>
                <span style={{ color: '#10b981', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Lock size={10} /> End-to-End Encrypted
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={18} color="#38bdf8" />
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem', fontWeight: 800 }}>Encrypted Direct Messages</h3>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {activePartner && (
              <button
                type="button"
                onClick={() => onOpenReport(activePartner, getChatTranscriptSnippet())}
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444',
                  borderRadius: 6,
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <ShieldAlert size={12} /> Report
              </button>
            )}
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!activePartner ? (
          /* Conversations List */
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
            {conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                <Sparkles size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>No conversations yet.</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Search any pet parent or click "Message" on their profile to start chatting.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.partnerId}
                  onClick={() =>
                    setActivePartner({
                      id: conv.partnerId,
                      name: conv.partnerName,
                      handle: `@${conv.partnerName.toLowerCase().replace(/\s+/g, '')}`,
                      avatar: conv.partnerAvatar,
                      bio: '',
                      followersCount: 0,
                      followingCount: 0,
                      postsCount: 0,
                    })
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: 'rgba(255,255,255,0.03)',
                    marginBottom: '0.4rem',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <img
                    src={conv.partnerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt=""
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>{conv.partnerName}</strong>
                      <span style={{ color: '#64748b', fontSize: '0.68rem' }}>
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      🔒 Encrypted Message
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Active Chat Thread */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                  <Lock size={20} color="#10b981" style={{ margin: '0 auto 0.4rem' }} />
                  Messages in this conversation are end-to-end encrypted. No third parties, including PetSOS servers, can read them.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === authUser?.id;
                  return (
                    <div
                      key={m._id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '78%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          background: isMe ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'rgba(255,255,255,0.08)',
                          color: '#f8fafc',
                          padding: '0.6rem 0.85rem',
                          borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          fontSize: '0.84rem',
                          lineHeight: 1.35,
                          wordBreak: 'break-word',
                        }}
                      >
                        {m.mediaUrl && (
                          <img
                            src={m.mediaUrl}
                            alt=""
                            style={{ width: '100%', borderRadius: 8, maxHeight: 180, objectFit: 'cover', marginBottom: '0.35rem' }}
                          />
                        )}
                        {m.decryptedText}
                      </div>
                      <span style={{ fontSize: '0.64rem', color: '#64748b', marginTop: 2 }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Photo Attachment Preview */}
            {activeImageUrl && (
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <img src={activeImageUrl} alt="preview" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Photo attached</span>
                <button type="button" onClick={clearImage} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(15,23,42,0.9)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <label style={{ cursor: 'pointer', color: '#94a3b8' }}>
                <ImageIcon size={18} />
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isUploading ? 'Uploading photo...' : 'Type an encrypted message...'}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 20,
                  padding: '0.5rem 0.85rem',
                  color: '#f8fafc',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                disabled={(!inputText.trim() && !activeImageUrl) || isSending || isUploading}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: (!inputText.trim() && !activeImageUrl) ? 'rgba(255,255,255,0.1)' : '#38bdf8',
                  color: '#0f172a',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
