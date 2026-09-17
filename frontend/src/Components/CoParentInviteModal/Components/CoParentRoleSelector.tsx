import React from 'react';

interface CoParentRoleSelectorProps {
  selectedRole: 'co_parent' | 'family_member' | 'caretaker';
  setSelectedRole: (role: 'co_parent' | 'family_member' | 'caretaker') => void;
}

export const CoParentRoleSelector: React.FC<CoParentRoleSelectorProps> = ({
  selectedRole,
  setSelectedRole,
}) => {
  return (
    <div className="invite-field-group">
      <label className="invite-field-label">Care Role & Access Level</label>
      <div className="invite-role-selector">
        <button
          type="button"
          className={`role-choice-pill ${selectedRole === 'co_parent' ? 'active' : ''}`}
          onClick={() => setSelectedRole('co_parent')}
        >
          🤝 Co-Parent (Full Access)
        </button>
        <button
          type="button"
          className={`role-choice-pill ${selectedRole === 'family_member' ? 'active' : ''}`}
          onClick={() => setSelectedRole('family_member')}
        >
          🏡 Family Household
        </button>
        <button
          type="button"
          className={`role-choice-pill ${selectedRole === 'caretaker' ? 'active' : ''}`}
          onClick={() => setSelectedRole('caretaker')}
        >
          🐕 Sitter / Caretaker
        </button>
      </div>
    </div>
  );
};
