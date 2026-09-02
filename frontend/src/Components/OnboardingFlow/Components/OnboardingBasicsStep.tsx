import React from 'react';
import type { PetProfile } from '../../../schemas';
import { SPECIES_OPTIONS } from '../../../data/petBreeds';

interface OnboardingBasicsStepProps {
  name: string;
  species: PetProfile['species'];
  customSpecies: string;
  onUpdate: (field: string, val: any) => void;
  onSpeciesSelect: (species: PetProfile['species']) => void;
}

export const OnboardingBasicsStep: React.FC<OnboardingBasicsStepProps> = ({
  name,
  species,
  customSpecies,
  onUpdate,
  onSpeciesSelect,
}) => {
  return (
    <div className="onboarding-step-body animate-fade-in">
      <div className="form-group">
        <label htmlFor="pet-name">What's your pet's name?</label>
        <input
          id="pet-name"
          className="form-input"
          placeholder="e.g. Luna, Bella, Rocky..."
          value={name}
          onChange={(e) => onUpdate('name', e.target.value)}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label>What species is your pet?</label>
        <div className="species-grid">
          {SPECIES_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`species-btn ${species === opt.value ? 'active' : ''}`}
              onClick={() => onSpeciesSelect(opt.value)}
            >
              <span className="species-icon">{opt.emoji}</span>
              <span className="species-label">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {species === 'other' && (
        <div className="form-group animate-slide-down">
          <label htmlFor="custom-species">Specify Animal Species / Kind</label>
          <input
            id="custom-species"
            className="form-input"
            placeholder="e.g., Parrot, Ferret, Horse, Chinchilla..."
            value={customSpecies}
            onChange={(e) => onUpdate('customSpecies', e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
