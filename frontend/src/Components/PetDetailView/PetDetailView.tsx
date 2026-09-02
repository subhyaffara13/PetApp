import { useState } from 'react';
import axios from 'axios';
import { ChevronLeft, Archive, RotateCcw } from 'lucide-react';
import { PetCard } from '../PetCard/PetCard';
import { MedicalTimeline } from '../MedicalTimeline/MedicalTimeline';
import { CoParentInviteModal } from '../CoParentInviteModal/CoParentInviteModal';
import { PetPassportIdentityCard } from './Components/PetPassportIdentityCard';
import { CoParentsSection } from './Components/CoParentsSection';
import { PetCareCalendar } from '../PetCareCalendar/PetCareCalendar';
import { useTranslation } from '../../context/LanguageContext';
import { API_URL } from '../../config/api';
import type { PetProfile } from '../../schemas';
import './PetDetailView.css';

interface PetDetailViewProps {
  pet: PetProfile;
  onBack: () => void;
  onEdit: (pet: PetProfile) => void;
  onDelete: (id: string) => void;
  onToggleArchive?: (pet: PetProfile) => void;
  onRefresh?: () => void;
}

export const PetDetailView = ({
  pet,
  onBack,
  onEdit,
  onDelete,
  onToggleArchive,
  onRefresh,
}: PetDetailViewProps) => {
  const { t } = useTranslation();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedTag, setCopiedTag] = useState(false);
  const [isRemovingCoParent, setIsRemovingCoParent] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'passport' | 'calendar'>('passport');

  const passportTag = pet.petId || 'PET-PASSPORT';

  const handleCopyTag = () => {
    navigator.clipboard.writeText(passportTag);
    setCopiedTag(true);
    setTimeout(() => setCopiedTag(false), 2000);
  };

  const handleRemoveCoParent = async (coParentUserId: string) => {
    if (!window.confirm('Remove this co-parent access? They will no longer see this pet passport.')) return;
    setIsRemovingCoParent(coParentUserId);
    try {
      await axios.delete(`${API_URL}/pet-profile/${pet._id}/co-parent/${coParentUserId}`);
      onRefresh?.();
    } catch {
    } finally {
      setIsRemovingCoParent(null);
    }
  };

  return (
    <div className="profile-page page page-padded" id="pet-detail-page">
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          <ChevronLeft size={16} /> {t('action.back', 'Back')}
        </button>

        {onToggleArchive && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onToggleArchive(pet)}
            id="detail-archive-toggle-btn"
          >
            {pet.isArchived ? (
              <><RotateCcw size={14} color="#10b981" /> {t('action.restore', 'Restore Pet')}</>
            ) : (
              <><Archive size={14} color="#f59e0b" /> {t('action.archive', 'Archive Pet')}</>
            )}
          </button>
        )}
      </div>

      <div className="profile-detail">
        <PetCard
          pet={pet}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleArchive={onToggleArchive}
          isSelected
        />

        <PetPassportIdentityCard
          pet={pet}
          passportTag={passportTag}
          copiedTag={copiedTag}
          onCopyTag={handleCopyTag}
        />

        <CoParentsSection
          pet={pet}
          isRemovingCoParent={isRemovingCoParent}
          onOpenInvite={() => setShowInviteModal(true)}
          onRemoveCoParent={handleRemoveCoParent}
        />

        <div className="pet-subtab-navigation">
          <button
            type="button"
            className={`pet-subtab-btn ${activeSubTab === 'passport' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('passport')}
          >
            🏥 Health History & Records
          </button>
          <button
            type="button"
            className={`pet-subtab-btn ${activeSubTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('calendar')}
          >
            📅 Care Schedule & Reminders
          </button>
        </div>

        {activeSubTab === 'calendar' ? (
          <PetCareCalendar
            pets={[pet]}
            currentPetId={pet._id}
          />
        ) : (
          <MedicalTimeline
            events={pet.medicalHistory || []}
            petId={pet._id}
            petName={pet.name}
            onRefresh={onRefresh}
          />
        )}
      </div>

      {showInviteModal && (
        <CoParentInviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          pet={pet}
          onSuccess={() => onRefresh?.()}
        />
      )}
    </div>
  );
};
