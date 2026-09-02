import React from 'react';
import { Dog, Scissors, Home, Stethoscope, Store } from 'lucide-react';

export type ProfessionalType = 'walker' | 'groomer' | 'sitter' | 'shelter' | 'clinic' | 'store';

interface RoleSelectionGridProps {
  selectedType: ProfessionalType;
  onSelect: (type: ProfessionalType) => void;
}

export const RoleSelectionGrid: React.FC<RoleSelectionGridProps> = ({
  selectedType,
  onSelect,
}) => {
  return (
    <div className="role-type-selector">
      <button
        type="button"
        className={`role-type-btn ${selectedType === 'walker' ? 'active' : ''}`}
        onClick={() => onSelect('walker')}
      >
        <Dog size={20} />
        <span>Dog Walker</span>
      </button>

      <button
        type="button"
        className={`role-type-btn ${selectedType === 'groomer' ? 'active' : ''}`}
        onClick={() => onSelect('groomer')}
      >
        <Scissors size={20} />
        <span>Pet Groomer</span>
      </button>

      <button
        type="button"
        className={`role-type-btn ${selectedType === 'sitter' ? 'active' : ''}`}
        onClick={() => onSelect('sitter')}
      >
        <Dog size={20} />
        <span>Pet Sitter</span>
      </button>

      <button
        type="button"
        className={`role-type-btn ${selectedType === 'shelter' ? 'active' : ''}`}
        onClick={() => onSelect('shelter')}
      >
        <Home size={20} />
        <span>Animal Shelter</span>
      </button>

      <button
        type="button"
        className={`role-type-btn ${selectedType === 'clinic' ? 'active' : ''}`}
        onClick={() => onSelect('clinic')}
      >
        <Stethoscope size={20} />
        <span>Vet Clinic</span>
      </button>

      <button
        type="button"
        className={`role-type-btn ${selectedType === 'store' ? 'active' : ''}`}
        onClick={() => onSelect('store')}
      >
        <Store size={20} />
        <span>Pet Store</span>
      </button>
    </div>
  );
};
