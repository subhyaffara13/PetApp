import { ChevronLeft, Archive, RotateCcw } from 'lucide-react';
import { PetCard } from '../PetCard/PetCard';
import { MedicalTimeline } from '../MedicalTimeline/MedicalTimeline';
import { useTranslation } from '../../context/LanguageContext';
import type { PetProfile } from '../../schemas';
import './PetDetailView.css';

interface PetDetailViewProps {
  pet: PetProfile;
  onBack: () => void;
  onEdit: (pet: PetProfile) => void;
  onDelete: (id: string) => void;
  onToggleArchive?: (pet: PetProfile) => void;
}

export const PetDetailView = ({
  pet,
  onBack,
  onEdit,
  onDelete,
  onToggleArchive,
}: PetDetailViewProps) => {
  const { t } = useTranslation();

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
              <>
                <RotateCcw size={14} color="#10b981" /> {t('action.restore', 'Restore Pet')}
              </>
            ) : (
              <>
                <Archive size={14} color="#f59e0b" /> {t('action.archive', 'Archive Pet')}
              </>
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
        <h3 className="profile-detail__section-title">
          {t('profile.health_passport', 'Verified Health Passport & Clinical History')}
        </h3>
        <MedicalTimeline
          events={pet.medicalHistory || []}
          petId={pet._id}
          petName={pet.name}
        />
      </div>
    </div>
  );
};
