import React, { useState } from 'react';
import axios from 'axios';

interface QuickAddPetInlineProps {
  onPetAdded: (newPet: any) => void;
  onCancel: () => void;
}

export const QuickAddPetInline: React.FC<QuickAddPetInlineProps> = ({ onPetAdded, onCancel }) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat' | 'other'>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<number>(2);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    setError('');

    const payload = {
      name,
      species,
      breed: breed || (species === 'dog' ? 'Mixed Canine' : 'Domestic Shorthair'),
      age: Number(age) || 1,
      gender: 'male',
      weight: 12,
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/pet-profile`, payload);
      onPetAdded(res.data);
    } catch {
      setError('Failed to add pet. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="quick-add-pet-form" onSubmit={handleSubmit}>
      <div className="quick-add-title">
        <span>🐾 Add New Pet to Passport</span>
        <button type="button" className="btn-cancel-inline" onClick={onCancel}>✕</button>
      </div>

      <div className="quick-add-inputs-row">
        <input
          type="text"
          required
          placeholder="Pet Name (e.g. Luna)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={species} onChange={(e) => setSpecies(e.target.value as any)}>
          <option value="dog">🐕 Dog</option>
          <option value="cat">🐈 Cat</option>
          <option value="other">🐾 Other</option>
        </select>
        <input
          type="text"
          placeholder="Breed (e.g. Beagle)"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
        />
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
