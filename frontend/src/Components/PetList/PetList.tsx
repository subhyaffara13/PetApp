import { useState } from 'react';
import { PetCard } from '../PetCard/PetCard';
import { Plus, Archive, PawPrint } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import type { PetProfile } from '../../schemas';
import './PetList.css';

interface PetListProps {
  pets: PetProfile[];
  isLoading: boolean;
  onEdit: (pet: PetProfile) => void;
  onDelete: (id: string) => void;
  onToggleArchive: (pet: PetProfile) => void;
  onInviteCoParent?: (pet: PetProfile) => void;
  onSelectPet: (pet: PetProfile) => void;
  onAddPet: () => void;
}

export const PetList = ({
  pets,
  isLoading,
  onEdit,
  onDelete,
  onToggleArchive,
  onInviteCoParent,
  onSelectPet,
  onAddPet,
}: PetListProps) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'active' | 'archived'>('active');

  const activePets = pets.filter((p) => !p.isArchived);
  const archivedPets = pets.filter((p) => !!p.isArchived);
  const displayedPets = tab === 'active' ? activePets : archivedPets;

  if (isLoading) {
    return (
      <div className="profile-skeletons">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 140, borderRadius: 'var(--radius-lg)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="pet-list-container">
      {/* SEGMENTED TAB CONTROLS */}
      <div className="pet-list-tabs">
        <button
          type="button"
          className={`pet-tab-btn ${tab === 'active' ? 'pet-tab-btn--active' : ''}`}
          onClick={() => setTab('active')}
          id="tab-active-pets"
        >
          <PawPrint size={15} />
          <span>{t('profile.active_pets', 'Active Pets')}</span>
          <span className="pet-tab-count">{activePets.length}</span>
        </button>

        <button
          type="button"
          className={`pet-tab-btn ${tab === 'archived' ? 'pet-tab-btn--active' : ''}`}
          onClick={() => setTab('archived')}
          id="tab-archived-pets"
        >
          <Archive size={15} />
          <span>{t('profile.archived_pets', 'Archived Passports')}</span>
          <span className="pet-tab-count">{archivedPets.length}</span>
        </button>
      </div>

      {/* EMPTY STATES */}
      {displayedPets.length === 0 && (
        <div className="profile-empty animate-fade-in">
          <span className="profile-empty__emoji">{tab === 'active' ? '🐾' : '📦'}</span>
          <h2>{tab === 'active' ? t('profile.no_pets', 'No active pets yet') : t('profile.no_archived', 'No archived pet passports')}</h2>
          <p>
            {tab === 'active'
              ? 'Add your first pet to get personalized advice and keep their health records safe.'
              : 'Archived pets and their medical records will be stored here safely.'}
          </p>
          {tab === 'active' && (
            <button className="btn btn-primary btn-lg" onClick={onAddPet} id="add-first-pet-btn">
              <Plus size={18} /> {t('profile.add_pet', 'Add Your Pet')}
            </button>
          )}
        </div>
      )}

      {/* PET CARDS LIST */}
      {displayedPets.length > 0 && (
        <div className="profile-list">
          {displayedPets.map((pet, i) => (
            <div
              key={pet._id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <PetCard
                pet={pet}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleArchive={onToggleArchive}
                onInviteCoParent={onInviteCoParent}
                onClick={() => onSelectPet(pet)}
              />
            </div>
          ))}

          {tab === 'active' && (
            <button
              className="profile-add-btn btn btn-ghost"
              onClick={onAddPet}
              id="add-pet-button"
            >
              <Plus size={18} /> {t('profile.add_pet', 'Add Another Pet')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
