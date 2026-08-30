import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { PetProfile } from '../../schemas';
import './PetEditForm.css';

interface PetEditFormProps {
  pet: PetProfile;
  onSave: (updated: PetProfile) => void;
  onCancel: () => void;
}

const speciesOptions = [
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐈 Cat' },
  { value: 'bird', label: '🐦 Bird' },
  { value: 'reptile', label: '🦎 Reptile' },
  { value: 'small_mammal', label: '🐹 Small Mammal' },
  { value: 'other', label: '🐾 Other' },
] as const;

export const PetEditForm = ({ pet, onSave, onCancel }: PetEditFormProps) => {
  const initialIsMonths = pet.age !== undefined && pet.age < 1 && pet.age > 0;
  const [ageUnit, setAgeUnit] = useState<'years' | 'months'>(initialIsMonths ? 'months' : 'years');
  const [ageVal, setAgeVal] = useState<number>(
    initialIsMonths ? Math.round(pet.age * 12) || 2 : pet.age || 1
  );
  const [dateOfBirth, setDateOfBirth] = useState<string>(pet.dateOfBirth || '');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const computedAgeYears =
      ageUnit === 'months'
        ? parseFloat((ageVal / 12).toFixed(2))
        : Number(ageVal);

    const updated: PetProfile = {
      ...pet,
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim(),
      age: computedAgeYears,
      dateOfBirth: dateOfBirth || undefined,
      weight: form.weight,
      gender: form.gender,
      knownConditions: form.knownConditions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      allergies: form.allergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      medications: form.medications
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
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

      <div className="pet-edit-form__body">
        {/* Name */}
        <label className="pet-edit-form__label">Name</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Pet name"
          required
          id="edit-pet-name"
        />

        {/* Species */}
        <label className="pet-edit-form__label">Species</label>
        <div className="pet-edit-form__species-grid">
          {speciesOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pet-edit-form__species-btn ${
                form.species === opt.value ? 'pet-edit-form__species-btn--active' : ''
              }`}
              onClick={() => update('species', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Breed */}
        <label className="pet-edit-form__label">Breed</label>
        <input
          className="input"
          value={form.breed}
          onChange={(e) => update('breed', e.target.value)}
          placeholder="e.g. Golden Retriever"
          id="edit-pet-breed"
        />

        {/* Date of Birth / Growth Age */}
        <div className="pet-edit-form__field" style={{ marginBottom: '1rem' }}>
          <label className="pet-edit-form__label">Date of Birth (FOR ACCURATE GROWTH AGE)</label>
          <input
            className="input"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            id="edit-pet-dob"
          />
        </div>

        {/* Age & Weight Row */}
        <div className="pet-edit-form__row">
          <div className="pet-edit-form__field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label className="pet-edit-form__label">Age ({ageUnit === 'months' ? 'חודשים' : 'שנים'})</label>
              <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: 2 }}>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: ageUnit === 'months' ? 'var(--color-primary)' : 'transparent',
                    color: ageUnit === 'months' ? '#fff' : 'var(--color-text-muted)',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 3,
                    padding: '2px 6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setAgeUnit('months')}
                >
                  חודשים (Mo)
                </button>
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: ageUnit === 'years' ? 'var(--color-primary)' : 'transparent',
                    color: ageUnit === 'years' ? '#fff' : 'var(--color-text-muted)',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 3,
                    padding: '2px 6px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setAgeUnit('years')}
                >
                  שנים (Yrs)
                </button>
              </div>
            </div>
            <input
              className="input"
              type="number"
              min={1}
              max={ageUnit === 'months' ? 36 : 50}
              value={ageVal}
              onChange={(e) => setAgeVal(Number(e.target.value))}
              id="edit-pet-age"
            />
          </div>
          <div className="pet-edit-form__field">
            <label className="pet-edit-form__label">Weight (kg)</label>
            <input
              className="input"
              type="number"
              min={0}
              max={500}
              step={0.1}
              value={form.weight}
              onChange={(e) => update('weight', Number(e.target.value))}
              id="edit-pet-weight"
            />
          </div>
        </div>

        {/* Gender */}
        <label className="pet-edit-form__label">Gender</label>
        <div className="pet-edit-form__gender-row">
          <button
            type="button"
            className={`btn ${form.gender === 'male' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => update('gender', 'male')}
          >
            ♂ Male
          </button>
          <button
            type="button"
            className={`btn ${form.gender === 'female' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => update('gender', 'female')}
          >
            ♀ Female
          </button>
        </div>

        {/* Known Conditions */}
        <label className="pet-edit-form__label">Known Conditions (comma separated)</label>
        <input
          className="input"
          value={form.knownConditions}
          onChange={(e) => update('knownConditions', e.target.value)}
          placeholder="e.g. Hip dysplasia, Diabetes"
          id="edit-pet-conditions"
        />

        {/* Allergies */}
        <label className="pet-edit-form__label">Allergies (comma separated)</label>
        <input
          className="input"
          value={form.allergies}
          onChange={(e) => update('allergies', e.target.value)}
          placeholder="e.g. Chicken, Pollen"
          id="edit-pet-allergies"
        />

        {/* Medications */}
        <label className="pet-edit-form__label">Medications (comma separated)</label>
        <input
          className="input"
          value={form.medications}
          onChange={(e) => update('medications', e.target.value)}
          placeholder="e.g. Apoquel 16mg daily"
          id="edit-pet-medications"
        />
      </div>

      {/* Footer */}
      <div className="pet-edit-form__footer">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          <Check size={16} /> Save Changes
        </button>
      </div>
    </form>
  );
};
