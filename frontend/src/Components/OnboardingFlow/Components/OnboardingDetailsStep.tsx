import React from 'react';
import type { PetProfile } from '../../../schemas';
import { getBreedsForSpecies } from '../../../data/petBreeds';

interface OnboardingDetailsStepProps {
  species: PetProfile['species'];
  breed: string;
  isCustomBreed: boolean;
  age: number;
  weight: number;
  gender: PetProfile['gender'];
  onUpdate: (field: string, val: any) => void;
  onBreedChange: (val: string) => void;
}

export const OnboardingDetailsStep: React.FC<OnboardingDetailsStepProps> = ({
  species,
  breed,
  isCustomBreed,
  age,
  weight,
  gender,
  onUpdate,
  onBreedChange,
}) => {
  const breedOptions = getBreedsForSpecies(species);

  return (
    <div className="onboarding-step-body animate-fade-in">
      <div className="form-group">
        <label>Breed</label>
        {!isCustomBreed ? (
          <div className="breed-select-wrapper">
            <select
              className="form-input"
              value={breedOptions.includes(breed) ? breed : '__custom__'}
              onChange={(e) => onBreedChange(e.target.value)}
            >
              {breedOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
              <option value="__custom__">✨ Other / Type Custom Breed...</option>
            </select>
          </div>
        ) : (
          <div className="custom-breed-group animate-slide-down">
            <input
              className="form-input"
              placeholder="Enter specific breed..."
              value={breed}
              onChange={(e) => onUpdate('breed', e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => onBreedChange(breedOptions[0] || 'Mixed Breed')}
            >
              Choose from list instead
            </button>
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Age (years)</label>
          <input
            type="number"
            min="0"
            max="40"
            className="form-input"
            value={age}
            onChange={(e) => onUpdate('age', Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>
        <div className="form-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            min="0.1"
            max="200"
            step="0.5"
            className="form-input"
            value={weight}
            onChange={(e) => onUpdate('weight', Math.max(0.1, parseFloat(e.target.value) || 0.1))}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Gender</label>
        <div className="gender-toggle">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              className={`gender-btn ${gender === g ? 'active' : ''}`}
              onClick={() => onUpdate('gender', g)}
            >
              {g === 'male' ? '♂ Male' : '♀ Female'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
