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
            <UserPlus size={20} color="#38bdf8" />
            <div>
              <h3>Invite Co-Parent or Household</h3>
              <p className="invite-subtitle">Share <strong>{pet.name}</strong>'s health passport & emergency access</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="invite-rules-banner">
          <Clock size={15} color="#38bdf8" />
          <span>Invitations expire after <strong>24 hours</strong>. Max 15 invites per day to prevent spam.</span>
        </div>

        {errorMessage && <div className="invite-error-box"><AlertTriangle size={15} /><span>{errorMessage}</span></div>}
        {successMessage && <div className="invite-success-box"><Check size={15} /><span>{successMessage}</span></div>}

        <div className="invite-search-section">
          <label>Search Registered Users</label>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, handle, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
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

        <div className="invite-modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSendInvite} disabled={!selectedUser || isSending}>
            {isSending ? 'Sending Request...' : 'Send 24h Invitation'}
          </button>
        </div>
      </div>
    </div>
  );
};
