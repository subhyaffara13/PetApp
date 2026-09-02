import React from 'react';
import { Camera, Trash, User as UserIcon } from 'lucide-react';

interface ProfileAvatarSectionProps {
  currentAvatar?: string;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: () => void;
}

export const ProfileAvatarSection: React.FC<ProfileAvatarSectionProps> = ({
  currentAvatar,
  isUploading,
  onFileChange,
  onRemovePhoto,
}) => {
  return (
    <div className="owner-avatar-edit-section">
      <div className="owner-avatar-wrapper">
        {currentAvatar ? (
          <img src={currentAvatar} alt="Profile" className="owner-avatar-img" />
        ) : (
          <div className="owner-avatar-placeholder">
            <UserIcon size={36} color="#64748b" />
          </div>
        )}
        {isUploading && <div className="owner-avatar-overlay">Uploading...</div>}
      </div>

      <div className="owner-avatar-actions">
        <label className="btn-change-avatar">
          <Camera size={14} /> Change Photo
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFileChange}
            disabled={isUploading}
          />
        </label>
        {currentAvatar && (
          <button
            type="button"
            className="btn-remove-avatar"
            onClick={onRemovePhoto}
          >
            <Trash size={14} /> Remove
          </button>
        )}
      </div>
    </div>
  );
};
