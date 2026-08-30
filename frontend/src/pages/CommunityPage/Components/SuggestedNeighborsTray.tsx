import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import type { UserProfileData } from './SocialProfileBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SuggestedNeighborsTrayProps {
  onSelectUser: (user: UserProfileData) => void;
}

export const SuggestedNeighborsTray: React.FC<SuggestedNeighborsTrayProps> = ({ onSelectUser }) => {
  const { user: authUser, isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const [suggestions, setSuggestions] = useState<UserProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get<UserProfileData[]>(`${API_URL}/community/suggestions`);
      setSuggestions(res.data || []);
    } catch (err) {
      console.error('Failed to load suggestions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [authUser]);

  const handleToggleFollow = async (e: React.MouseEvent, user: UserProfileData) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please sign in to follow neighbors', 'info', '🔒 Sign In Required');
      openAuthModal('/community');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/community/users/${user.id}/follow`);
      setSuggestions((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isFollowing: res.data.isFollowing, followersCount: res.data.targetUser.followersCount } : u))
      );
      showToast(
        res.data.isFollowing ? `Now following ${user.name}` : `Unfollowed ${user.name}`,
        'info',
        res.data.isFollowing ? '👥 Following' : 'Unfollowed'
      );
    } catch {
      showToast('Follow failed. Please try again.', 'error', '❌ Action Failed');
    }
  };

  if (suggestions.length === 0 && !isLoading) return null;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', padding: '0 0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={15} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '0.88rem', color: '#f8fafc', fontWeight: 800 }}>Suggested Neighbors</h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Based on proximity & pets</span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.65rem',
          overflowX: 'auto',
          paddingBottom: '0.4rem',
          scrollbarWidth: 'none',
        }}
      >
        {suggestions.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            style={{
              flex: '0 0 148px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: '0.85rem 0.6rem',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              transition: 'transform 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={user.name}
              style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', marginBottom: '0.4rem', border: '2px solid #38bdf8' }}
            />

            <strong style={{ color: '#f8fafc', fontSize: '0.8rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
              {user.name}
            </strong>
            <span style={{ color: '#94a3b8', fontSize: '0.68rem', display: 'block', marginBottom: '0.35rem' }}>
              {user.handle}
            </span>

            {/* Smart Reason Badge */}
            <div
              style={{
                background: 'rgba(56,189,248,0.1)',
                color: '#38bdf8',
                borderRadius: 6,
                padding: '2px 4px',
                fontSize: '0.64rem',
                fontWeight: 700,
                marginBottom: '0.6rem',
                lineHeight: 1.2,
                maxHeight: 28,
                overflow: 'hidden',
              }}
            >
              {user.suggestionReason || `${user.followersCount || 0} followers`}
            </div>

            <button
              type="button"
              onClick={(e) => handleToggleFollow(e, user)}
              style={{
                width: '100%',
                padding: '0.35rem',
                background: user.isFollowing ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #38bdf8, #0284c7)',
                border: user.isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none',
                color: user.isFollowing ? '#f8fafc' : '#0f172a',
                borderRadius: 6,
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
              }}
            >
              {user.isFollowing ? <><UserCheck size={12} /> Following</> : <><UserPlus size={12} /> Follow</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
