import { calculatePetAge, type PetProfile } from '../../schemas';
import { Edit3, Trash2, FileText, Archive, RotateCcw } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import './PetCard.css';

interface PetCardProps {
  pet: PetProfile;
  onEdit: (pet: PetProfile) => void;
  onDelete: (id: string) => void;
  onToggleArchive?: (pet: PetProfile) => void;
  isSelected?: boolean;
  onClick?: () => void;
}

const speciesEmoji: Record<string, string> = {
  dog: '🐕',
  cat: '🐈',
  bird: '🐦',
  reptile: '🦎',
  small_mammal: '🐹',
  other: '🐾',
};

export const PetCard = ({
  pet,
  onEdit,
  onDelete,
  onToggleArchive,
  isSelected,
  onClick,
}: PetCardProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={`pet-card card ${isSelected ? 'pet-card--selected' : ''} ${pet.isArchived ? 'pet-card--archived' : ''}`}
      onClick={onClick}
      id={`pet-card-${pet._id}`}
    >
      <div className="pet-card__header">
        <div className="pet-card__avatar">
          <span>{speciesEmoji[pet.species] || '🐾'}</span>
        </div>
        <div className="pet-card__info">
          <div className="pet-card__name-row">
            <h3 className="pet-card__name">{pet.name}</h3>
            {pet.petId && (
              <span className="pet-card__id-tag" title="Unique Pet Passport ID">
                #{pet.petId}
              </span>
            )}
            {pet.isArchived && (
              <span className="pet-card__archived-badge">
                {t('profile.archived_badge', 'ARCHIVED')}
              </span>
            )}
          </div>
          <p className="pet-card__breed">
            {pet.breed}
            {pet.coParents && pet.coParents.length > 0 && (
              <span className="pet-card__coparent-badge">
                🤝 {pet.coParents.length} Co-Parent{pet.coParents.length > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div className="pet-card__actions">
          {onToggleArchive && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleArchive(pet);
              }}
              title={pet.isArchived ? t('action.restore', 'Restore Pet') : t('action.archive', 'Archive Pet')}
              aria-label={pet.isArchived ? 'Restore pet' : 'Archive pet'}
            >
              {pet.isArchived ? <RotateCcw size={14} color="#10b981" /> : <Archive size={14} color="#f59e0b" />}
            </button>
          )}
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(pet);
            }}
            title={t('action.edit', 'Edit')}
            aria-label="Edit pet"
          >
            <Edit3 size={14} />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(pet._id!);
            }}
            title={t('action.delete', 'Delete')}
            aria-label="Delete pet"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="pet-card__details">
        <div className="pet-card__stat">
          <span className="pet-card__stat-label">Age</span>
          <span className="pet-card__stat-value">
            {calculatePetAge(pet.dateOfBirth, pet.age)}
          </span>
        </div>
        <div className="pet-card__stat">
          <span className="pet-card__stat-label">Weight</span>
          <span className="pet-card__stat-value">{pet.weight}kg</span>
        </div>
        <div className="pet-card__stat">
          <span className="pet-card__stat-label">Gender</span>
          <span className="pet-card__stat-value">{pet.gender === 'male' ? '♂' : '♀'}</span>
        </div>
      </div>

      {pet.knownConditions.length > 0 && (
        <div className="pet-card__conditions">
          {pet.knownConditions.map((c, i) => (
            <span key={i} className="badge badge-tag">{c}</span>
          ))}
        </div>
      )}

      {pet.medicalHistory.length > 0 && (
        <div className="pet-card__history-hint">
          <FileText size={12} />
          <span>{pet.medicalHistory.length} medical record{pet.medicalHistory.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};
