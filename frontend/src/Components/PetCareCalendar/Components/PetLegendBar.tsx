import React from 'react';
import type { PetProfile } from '../../../schemas';

interface PetLegendBarProps {
  pets: PetProfile[];
  selectedFilterPetId: string;
  onSelectPetFilter: (petId: string) => void;
  getPetColor: (pet: PetProfile) => string;
}

export const PetLegendBar: React.FC<PetLegendBarProps> = ({
  pets,
  selectedFilterPetId,
  onSelectPetFilter,
  getPetColor,
}) => {
  if (pets.length <= 1) return null;

  return (
    <div className="pet-legend-filter-bar">
      <button
        type="button"
        className={`pet-legend-pill ${selectedFilterPetId === 'all' ? 'active' : ''}`}
        onClick={() => onSelectPetFilter('all')}
      >
        <span className="color-dot" style={{ background: '#38bdf8' }} />
        <span>All Pets ({pets.length})</span>
      </button>

      {pets.map((pet) => {
        const color = getPetColor(pet);
        const id = pet._id || pet.petId || pet.name;
        const isActive = selectedFilterPetId === id;

        return (
          <button
            key={id}
            type="button"
            className={`pet-legend-pill ${isActive ? 'active' : ''}`}
            onClick={() => onSelectPetFilter(id)}
            style={{ borderColor: isActive ? color : undefined }}
          >
            <span className="color-dot" style={{ background: color }} />
            <span>{pet.name} ({pet.species})</span>
          </button>
        );
      })}
    </div>
  );
};
