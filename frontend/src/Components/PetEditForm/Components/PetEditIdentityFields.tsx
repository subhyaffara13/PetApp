import React from 'react';
import type { PetProfile } from '../../../schemas';
import { SPECIES_OPTIONS, getBreedsForSpecies } from '../../../data/petBreeds';

interface PetEditIdentityFieldsProps {
  name: string;
  species: PetProfile['species'];
  breed: string;
  isCustomBreed: boolean;
  ageUnit: 'years' | 'months';
  setAgeUnit: (u: 'years' | 'months') => void;
  ageVal: number;
  setAgeVal: (v: number) => void;
  dateOfBirth: string;
  setDateOfBirth: (dob: string) => void;
  weight: number;
  gender: PetProfile['gender'];
  onUpdate: (field: string, val: any) => void;
  onSpeciesSelect: (species: PetProfile['species']) => void;
  onBreedChange: (val: string) => void;
}

export const PetEditIdentityFields: React.FC<PetEditIdentityFieldsProps> = ({
  name,
  species,
  breed,
  isCustomBreed,
  ageUnit,
  setAgeUnit,
  ageVal,
  setAgeVal,
  dateOfBirth,
  setDateOfBirth,
  weight,
  gender,
  onUpdate,
  onSpeciesSelect,
  onBreedChange,
}) => {
  const currentBreeds = getBreedsForSpecies(species);

  return (
    <>
      <div className="form-group">
        <label htmlFor="edit-name">Pet Name</label>
        <input
          id="edit-name"
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => onUpdate('name', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Species</label>
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

      <div className="form-group">
        <label htmlFor="edit-breed">Breed</label>
        {!isCustomBreed ? (
          <div className="breed-select-wrapper">
            <select
              id="edit-breed"
              className="form-input"
              value={currentBreeds.includes(breed) ? breed : '__custom__'}
              onChange={(e) => onBreedChange(e.target.value)}
            >
              {currentBreeds.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
              <option value="__custom__">✨ Other / Type Custom Breed...</option>
            </select>
          </div>
        ) : (
          <div className="custom-breed-input-wrapper animate-fade-in">
            <input
              id="edit-breed-custom"
              type="text"
              className="form-input"
              placeholder="Type exact breed name..."
              value={breed}
              onChange={(e) => onUpdate('breed', e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => onBreedChange(currentBreeds[0] || 'Mixed Breed')}
            >
              Choose from list
            </button>
          </div>
        )}
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="edit-age">Age</label>
          <div className="age-unit-toggle">
            <button
              type="button"
              className={`unit-pill ${ageUnit === 'years' ? 'active' : ''}`}
              onClick={() => setAgeUnit('years')}
            >
              Years
            </button>
            <button
              type="button"
              className={`unit-pill ${ageUnit === 'months' ? 'active' : ''}`}
              onClick={() => setAgeUnit('months')}
            >
              Months (Puppy/Kitten)
            </button>
          </div>
        </div>
        <input
          id="edit-age"
          type="number"
          min="0"
          max={ageUnit === 'months' ? 36 : 40}
          className="form-input"
          value={ageVal}
          onChange={(e) => setAgeVal(Math.max(0, parseInt(e.target.value) || 0))}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="edit-dob">Date of Birth</label>
          <input
            id="edit-dob"
            type="date"
            className="form-input"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-weight">Weight (kg)</label>
          <input
            id="edit-weight"
            type="number"
            min="0.1"
            max="200"
            step="0.1"
            className="form-input"
            value={weight}
            onChange={(e) => onUpdate('weight', parseFloat(e.target.value) || 0)}
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
    </>
  );
};
