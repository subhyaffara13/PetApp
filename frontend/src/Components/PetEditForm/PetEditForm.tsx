import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { PetProfile } from '../../schemas';
import { getBreedsForSpecies } from '../../data/petBreeds';
import { PetEditIdentityFields } from './Components/PetEditIdentityFields';
import { PetEditMedicalFields } from './Components/PetEditMedicalFields';
import './PetEditForm.css';

interface PetEditFormProps {
  pet: PetProfile;
  onSave: (updated: PetProfile) => void;
  onCancel: () => void;
}

export const PetEditForm = ({ pet, onSave, onCancel }: PetEditFormProps) => {
  const initialIsMonths = pet.age !== undefined && pet.age < 1 && pet.age > 0;
  const [ageUnit, setAgeUnit] = useState<'years' | 'months'>(initialIsMonths ? 'months' : 'years');
  const [ageVal, setAgeVal] = useState<number>(
    initialIsMonths ? Math.round(pet.age * 12) || 2 : pet.age || 1
  );
  const [dateOfBirth, setDateOfBirth] = useState<string>(pet.dateOfBirth || '');
  const [isCustomBreed, setIsCustomBreed] = useState(false);

  const [form, setForm] = useState({
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    weight: pet.weight,
    gender: pet.gender,
    knownConditions: pet.knownConditions.join(', '),
    allergies: pet.allergies.join(', '),
    medications: pet.medications.join(', '),
  });

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSpeciesSelect = (newSpecies: PetProfile['species']) => {
    const availableBreeds = getBreedsForSpecies(newSpecies);
    setForm((prev) => ({
      ...prev,
      species: newSpecies,
      breed: availableBreeds[0] || 'Mixed Breed',
    }));
    setIsCustomBreed(false);
  };

  const handleBreedChange = (val: string) => {
    if (val === '__custom__') {
      setIsCustomBreed(true);
      update('breed', '');
    } else {
      setIsCustomBreed(false);
      update('breed', val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const computedAgeYears =
      ageUnit === 'months' ? parseFloat((ageVal / 12).toFixed(2)) : Number(ageVal);

    const updated: PetProfile = {
      ...pet,
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim() || 'Mixed Breed',
      age: computedAgeYears,
      dateOfBirth: dateOfBirth || undefined,
      weight: form.weight,
      gender: form.gender,
      knownConditions: form.knownConditions.split(',').map((s) => s.trim()).filter(Boolean),
      allergies: form.allergies.split(',').map((s) => s.trim()).filter(Boolean),
      medications: form.medications.split(',').map((s) => s.trim()).filter(Boolean),
    };

    onSave(updated);
  };

  return (
    <form className="pet-edit-form glass-card" onSubmit={handleSubmit} id="pet-edit-form">
      <div className="pet-edit-form__header">
        <h3>Edit {pet.name}</h3>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onCancel}>
          <X size={18} />
        </button>
      </div>

      <PetEditIdentityFields
        name={form.name}
        species={form.species}
        breed={form.breed}
        isCustomBreed={isCustomBreed}
        ageUnit={ageUnit}
        setAgeUnit={setAgeUnit}
        ageVal={ageVal}
        setAgeVal={setAgeVal}
        dateOfBirth={dateOfBirth}
        setDateOfBirth={setDateOfBirth}
        weight={form.weight}
        gender={form.gender}
        onUpdate={update}
        onSpeciesSelect={handleSpeciesSelect}
        onBreedChange={handleBreedChange}
      />

      <PetEditMedicalFields
        knownConditions={form.knownConditions}
        allergies={form.allergies}
        medications={form.medications}
        onUpdate={update}
      />

      <div className="pet-edit-form__actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary btn-sm">
          <Check size={16} /> Save Changes
        </button>
      </div>
    </form>
  );
};
