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
    <div className="role-selection-group">
      <label>Care Role & Access Level</label>
      <div className="role-pills-row">
        <button
          type="button"
          className={`role-pill-btn ${selectedRole === 'co_parent' ? 'active' : ''}`}
          onClick={() => setSelectedRole('co_parent')}
        >
          🤝 Co-Parent (Full Access)
        </button>
        <button
          type="button"
          className={`role-pill-btn ${selectedRole === 'family_member' ? 'active' : ''}`}
          onClick={() => setSelectedRole('family_member')}
        >
          🏡 Family Household
        </button>
        <button
          type="button"
          className={`role-pill-btn ${selectedRole === 'caretaker' ? 'active' : ''}`}
          onClick={() => setSelectedRole('caretaker')}
        >
          🐕 Sitter / Caretaker
        </button>
      </div>
    </div>
  );
};
