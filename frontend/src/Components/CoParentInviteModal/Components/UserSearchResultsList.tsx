import React from 'react';
import type { User } from '../../../schemas';
import { Check } from 'lucide-react';

interface UserSearchResultsListProps {
  searchResults: User[];
  selectedUser: User | null;
  isSearching: boolean;
  searchQuery: string;
  onSelectUser: (user: User) => void;
}

export const UserSearchResultsList: React.FC<UserSearchResultsListProps> = ({
  searchResults,
  selectedUser,
  isSearching,
  searchQuery,
  onSelectUser,
}) => {
  if (isSearching) {
    return <div className="searching-spinner">Searching registered users...</div>;
  }

  if (searchQuery.trim().length >= 2 && searchResults.length === 0) {
    return <div className="no-users-found">No registered users match "{searchQuery}".</div>;
  }

  if (searchResults.length === 0) {
    return null;
  }

  return (
    <div className="search-results-list">
      {searchResults.map((u) => {
        const isSelected = selectedUser?.id === u.id;
        return (
          <div
            key={u.id}
            className={`search-result-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectUser(u)}
          >
            <div className="result-user-info">
              {u.avatar ? (
                <img src={u.avatar} alt={u.name} className="result-avatar" />
              ) : (
                <div className="result-avatar-placeholder">
                  {u.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <strong className="result-name">{u.name}</strong>
                <span className="result-email">{u.email}</span>
              </div>
            </div>
            {isSelected && <Check size={16} color="#38bdf8" />}
          </div>
        );
      })}
    </div>
  );
};
