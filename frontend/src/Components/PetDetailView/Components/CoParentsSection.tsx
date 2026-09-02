import React from 'react';
import { Users, UserPlus, Trash2 } from 'lucide-react';
import type { PetProfile } from '../../../schemas';

interface CoParentsSectionProps {
  pet: PetProfile;
  isRemovingCoParent: string | null;
  onOpenInvite: () => void;
  onRemoveCoParent: (userId: string) => void;
}

export const CoParentsSection: React.FC<CoParentsSectionProps> = ({
  pet,
  isRemovingCoParent,
  onOpenInvite,
  onRemoveCoParent,
}) => {
  return (
    <div className="pet-coparents-section card">
      <div className="coparents-header">
        <div className="coparents-title-group">
          <Users size={18} color="#38bdf8" />
          <h4>Co-Parents & Family Household</h4>
        </div>
        <button
          className="btn btn-secondary btn-xs btn-invite-coparent"
          onClick={onOpenInvite}
        >
          <UserPlus size={13} /> Invite Co-Parent
        </button>
      </div>

      <div className="coparents-list">
        {pet.coParents && pet.coParents.length > 0 ? (
          pet.coParents.map((cp) => (
            <div key={cp.userId} className="coparent-pill-row">
              <div className="coparent-avatar-circle">
                {cp.name ? cp.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="coparent-pill-info">
                <strong>{cp.name || cp.email}</strong>
                <span className="coparent-role-tag">
                  {cp.role === 'co_parent'
                    ? '🤝 Co-Parent'
                    : cp.role === 'family_member'
                      ? '🏡 Family'
                      : '🐕 Caretaker'}
                </span>
              </div>
              <button
                className="btn-remove-coparent"
                onClick={() => onRemoveCoParent(cp.userId)}
                disabled={isRemovingCoParent === cp.userId}
                title="Remove access"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        ) : (
          <p className="no-coparents-text">
            No secondary co-parents or family added yet. Invite another user to share {pet.name}'s passport.
          </p>
        )}
      </div>
    </div>
  );
};
