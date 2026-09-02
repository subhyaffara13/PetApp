import React from 'react';

interface UserProfileEditFormProps {
  editName: string;
  setEditName: (v: string) => void;
  editHandle: string;
  setEditHandle: (v: string) => void;
  handleStatus: { checking: boolean; available?: boolean; message?: string };
  editBio: string;
  setEditBio: (v: string) => void;
  isSaving: boolean;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const UserProfileEditForm: React.FC<UserProfileEditFormProps> = ({
  editName,
  setEditName,
  editHandle,
  setEditHandle,
  handleStatus,
  editBio,
  setEditBio,
  isSaving,
  onSave,
  onCancel,
}) => {
  return (
    <form onSubmit={onSave} className="profile-edit-modal-form">
      <div className="form-group">
        <label>Full Name</label>
        <input
          type="text"
          className="form-input"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <div className="label-with-status">
          <label>Unique Handle (@)</label>
          {handleStatus.checking && <span className="handle-status checking">Checking...</span>}
          {!handleStatus.checking && handleStatus.available === true && (
            <span className="handle-status available">✓ Available</span>
          )}
          {!handleStatus.checking && handleStatus.available === false && (
            <span className="handle-status taken">✕ {handleStatus.message || 'Taken'}</span>
          )}
        </div>
        <div className="handle-input-wrapper">
          <span className="handle-prefix">@</span>
          <input
            type="text"
            className="form-input handle-field"
            value={editHandle}
            onChange={(e) => setEditHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Bio & Pets</label>
        <textarea
          rows={3}
          className="form-input"
          placeholder="Tell neighbors about you and your furry family..."
          value={editBio}
          onChange={(e) => setEditBio(e.target.value)}
        />
      </div>

      <div className="edit-form-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={isSaving || handleStatus.available === false}
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};
