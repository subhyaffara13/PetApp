import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, X } from 'lucide-react';
import type { UserProfileData } from './SocialProfileBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UserSearchHeaderProps {
  onSelectUser: (user: UserProfileData) => void;
}

export const UserSearchHeader: React.FC<UserSearchHeaderProps> = ({ onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfileData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get<UserProfileData[]>(`${API_URL}/community/users/search`, {
          params: { q: query.trim() },
        });
        setResults(res.data || []);
        setIsOpen(true);
      } catch (err) {
        console.error('User search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="user-search-header-container" ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20,
          padding: '0.4rem 0.85rem',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pet parents (@handle, name)..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#f8fafc',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#131e30',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            maxHeight: 280,
            overflowY: 'auto',
            zIndex: 100,
            padding: '0.35rem',
          }}
        >
          {isSearching ? (
            <div style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
              Searching pet parents...
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '0.75rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
              No pet parents found matching "{query}"
            </div>
          ) : (
            results.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  setIsOpen(false);
                  setQuery('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.7rem',
                  padding: '0.5rem 0.6rem',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </strong>
                    <span style={{ color: '#38bdf8', fontSize: '0.72rem' }}>{user.handle}</span>
                  </div>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.73rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.bio || `${user.followersCount || 0} followers`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
