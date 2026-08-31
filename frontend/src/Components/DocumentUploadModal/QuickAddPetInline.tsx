import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { SPECIES_OPTIONS, getBreedsForSpecies } from '../../data/petBreeds';

interface QuickAddPetInlineProps {
  onPetAdded: (newPet: any) => void;
  onCancel: () => void;
}

export const QuickAddPetInline: React.FC<QuickAddPetInlineProps> = ({ onPetAdded, onCancel }) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<string>('dog');
  const [breed, setBreed] = useState('Golden Retriever');
  const [isCustomBreed, setIsCustomBreed] = useState(false);
  const [age, setAge] = useState<number>(2);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSpeciesChange = (newSpecies: string) => {
    setSpecies(newSpecies);
    const availableBreeds = getBreedsForSpecies(newSpecies);
    setBreed(availableBreeds[0] || 'Mixed Breed');
    setIsCustomBreed(false);
  };

  const handleBreedChange = (val: string) => {
    if (val === '__custom__') {
      setIsCustomBreed(true);
      setBreed('');
    } else {
      setIsCustomBreed(false);
      setBreed(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    setError('');

    const payload = {
      name: name.trim(),
      species,
      breed: breed.trim() || (species === 'dog' ? 'Mixed Canine' : 'Domestic Shorthair'),
      age: Number(age) || 1,
      gender: 'male',
      weight: 12,
    };

    try {
      const res = await axios.post(`${API_URL}/pet-profile`, payload);
      onPetAdded(res.data);
    } catch {
      setError('Failed to add pet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentBreeds = getBreedsForSpecies(species);

  return (
    <form className="quick-add-pet-form" onSubmit={handleSubmit}>
      <div className="quick-add-title">
        <span>🐾 Add New Pet to Passport</span>
        <button type="button" className="btn-cancel-inline" onClick={onCancel}>✕</button>
      </div>

      <div className="quick-add-inputs-row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <input
          type="text"
          required
          placeholder="Pet Name (e.g. Luna)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={species} onChange={(e) => handleSpeciesChange(e.target.value)}>
          {SPECIES_OPTIONS.map((sp) => (
            <option key={sp.value} value={sp.value}>{sp.emoji} {sp.label}</option>
          ))}
        </select>
        <select value={isCustomBreed ? '__custom__' : breed} onChange={(e) => handleBreedChange(e.target.value)}>
          {currentBreeds.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
          <option value="__custom__">✏️ Custom Breed...</option>
        </select>
        {isCustomBreed && (
          <input
            type="text"
            placeholder="Type breed..."
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            style={{ width: '120px' }}
            autoFocus
          />
        )}
        <input
          type="number"
          placeholder="Age"
          value={age}
          min={0}
          max={30}
          onChange={(e) => setAge(Number(e.target.value))}
          style={{ width: '60px' }}
        />
        <button type="submit" className="btn-save-inline-pet" disabled={isSaving}>
          {isSaving ? 'Adding...' : '✓ Add Pet'}
        </button>
      </div>
      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>
      )}
    </form>
  );
};
