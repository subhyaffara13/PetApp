import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import type { PetProfile, User } from '../../schemas';
import { UserPlus, Search, Clock, Check, X, AlertTriangle } from 'lucide-react';
import { UserSearchResultsList } from './Components/UserSearchResultsList';
import { CoParentRoleSelector } from './Components/CoParentRoleSelector';
import './CoParentInviteModal.css';

interface CoParentInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  pet: PetProfile;
  onSuccess: () => void;
}

export const CoParentInviteModal: React.FC<CoParentInviteModalProps> = ({
  isOpen,
  onClose,
  pet,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<'co_parent' | 'family_member' | 'caretaker'>('co_parent');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser(null);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get<User[]>(`${API_URL}/pet-profile/users/search?q=${encodeURIComponent(trimmed)}`);
        setSearchResults(res.data);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(debounceRef.current);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSendInvite = async () => {
    if (!selectedUser) return setErrorMessage('Please select a user to invite.');
    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await axios.post(`${API_URL}/pet-profile/${pet._id}/co-parent/invite`, {
        toUserId: selectedUser.id,
        role: selectedRole,
      });
      setSuccessMessage(`Invitation sent to ${selectedUser.name}! (Valid for 24h)`);
      setTimeout(() => { onSuccess(); onClose(); }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to send co-parent invitation.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="invite-modal-backdrop" onClick={onClose}>
      <div className="invite-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="invite-modal-header">
          <div className="invite-title-group">
            <div className="invite-header-icon">
              <UserPlus size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 className="invite-heading">Invite Co-Parent or Household</h3>
              <p className="invite-subheading">Share <strong>{pet.name}</strong>'s health passport & emergency access</p>
            </div>
          </div>
          <button className="invite-close-btn" onClick={onClose} aria-label="Close modal"><X size={18} /></button>
        </div>

        <div className="invite-modal-body">
          <div className="invite-rules-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', color: 'var(--color-text-secondary, #94a3b8)' }}>
            <Clock size={15} color="#38bdf8" />
            <span>Invitations expire after <strong style={{ color: '#38bdf8' }}>24 hours</strong>. Max 15 invites per day to prevent spam.</span>
          </div>

          {errorMessage && <div className="invite-error-banner"><AlertTriangle size={15} /><span>{errorMessage}</span></div>}
          {successMessage && <div className="invite-success-banner"><Check size={15} /><span>{successMessage}</span></div>}

          <div className="invite-field-group">
            <label className="invite-field-label">Search Registered Users</label>
            <div className="invite-search-wrapper">
              <Search size={16} className="invite-search-icon" />
              <input
                type="text"
                className="invite-search-input"
                placeholder="Search by name, handle, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {isSearching && <div className="invite-search-spinner" />}
            </div>
            <UserSearchResultsList
              searchResults={searchResults}
              selectedUser={selectedUser}
              isSearching={isSearching}
              searchQuery={searchQuery}
              onSelectUser={setSelectedUser}
            />
          </div>

          <CoParentRoleSelector selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
        </div>

        <div className="invite-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 22px', borderTop: '1px solid rgba(148, 163, 184, 0.12)', background: 'var(--color-bg-elevated, rgba(15, 23, 42, 0.4))' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSendInvite} disabled={!selectedUser || isSending}>
            {isSending ? 'Sending Request...' : 'Send 24h Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
};
