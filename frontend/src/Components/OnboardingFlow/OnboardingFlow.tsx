import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import type { PetProfile } from '../../schemas';
import { validateProfanity } from '../../functions/profanityFilter';
import { ContextualSelect } from '../ContextualSelect/ContextualSelect';
import './OnboardingFlow.css';

interface OnboardingFlowProps {
  onComplete: (pet: Omit<PetProfile, '_id' | 'createdAt' | 'updatedAt' | 'medicalHistory'>) => void;
  onCancel: () => void;
}

const STEPS = ['Basics', 'Details', 'Health'];

const speciesOptions = [
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐈 Cat' },
  { value: 'bird', label: '🐦 Bird' },
  { value: 'reptile', label: '🦎 Reptile' },
  { value: 'small_mammal', label: '🐹 Small Mammal' },
  { value: 'other', label: '🐾 Other' },
] as const;

export const OnboardingFlow = ({ onComplete, onCancel }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    species: 'dog' as PetProfile['species'],
    customSpecies: '',
    breed: '',
    age: 1,
    weight: 5,
    gender: 'male' as PetProfile['gender'],
    medications: '',
  });

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const handleNext = () => {
    if (step === 0) {
      if (!form.name.trim()) {
        setValidationError('Please enter a pet name.');
        return;
      }
      const profanityCheck = validateProfanity(form.name);
      if (!profanityCheck.isValid) {
        setValidationError(profanityCheck.error || 'Inappropriate pet name detected.');
        return;
      }
      if (form.species === 'other' && !form.customSpecies.trim()) {
        setValidationError('Please specify the animal kind.');
        return;
      }
      if (form.species === 'other') {
        const speciesProfanity = validateProfanity(form.customSpecies);
        if (!speciesProfanity.isValid) {
          setValidationError(speciesProfanity.error || 'Inappropriate animal kind name.');
          return;
        }
      }
    }

    if (step === 1) {
      if (!form.breed.trim()) {
        setValidationError('Please enter a breed or type.');
        return;
      }
      const breedProfanity = validateProfanity(form.breed);
      if (!breedProfanity.isValid) {
        setValidationError(breedProfanity.error || 'Inappropriate text detected.');
        return;
      }
    }

    setValidationError(null);
    setStep((s) => s + 1);
  };

  const handleComplete = () => {
    const breedDisplay =
      form.species === 'other' && form.customSpecies.trim()
        ? `${form.customSpecies.trim()} (${form.breed})`
        : form.breed;

    onComplete({
      name: form.name.trim(),
      species: form.species,
      breed: breedDisplay,
      age: form.age,
      weight: form.weight,
      gender: form.gender,
      knownConditions: selectedConditions,
      allergies: selectedAllergies,
      medications: form.medications
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="onboarding glass-card" id="onboarding-flow">
      {/* Progress */}
      <div className="onboarding__progress">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`onboarding__step ${i <= step ? 'onboarding__step--active' : ''} ${
              i < step ? 'onboarding__step--done' : ''
            }`}
          >
            <div className="onboarding__step-dot">
              {i < step ? <Check size={12} /> : i + 1}
            </div>
            <span className="onboarding__step-label">{s}</span>
          </div>
        ))}
      </div>

      {validationError && (
        <div className="onboarding__error">
          <AlertCircle size={14} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="onboarding__content animate-fade-in" key={step}>
        {step === 0 && (
          <>
            <h3>What's your pet's name?</h3>
            <input
              className="input"
              placeholder="e.g. Buddy"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              autoFocus
              id="onboarding-name"
            />

            <h4>Species</h4>
            <div className="onboarding__species-grid">
              {speciesOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`onboarding__species-btn ${
                    form.species === opt.value ? 'onboarding__species-btn--active' : ''
                  }`}
                  onClick={() => update('species', opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom Species Input when "Other" is picked */}
            {form.species === 'other' && (
              <div className="onboarding__custom-species animate-fade-in">
                <label className="onboarding__label">Specify Animal Kind</label>
                <input
                  className="input"
                  placeholder="e.g. Ferret, Chinchilla, Turtle, Horse"
                  value={form.customSpecies}
                  onChange={(e) => update('customSpecies', e.target.value)}
                  id="onboarding-custom-species"
                />
              </div>
            )}

            <h4>Gender</h4>
            <div className="onboarding__gender-row">
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
          </>
        )}

        {step === 1 && (
          <>
            <h3>Tell us about {form.name}</h3>
            <label className="onboarding__label">Breed / Variant</label>
            <input
              className="input"
              placeholder="e.g. Golden Retriever, Persian, Angora"
              value={form.breed}
              onChange={(e) => update('breed', e.target.value)}
              autoFocus
              id="onboarding-breed"
            />

            <label className="onboarding__label">Age (years)</label>
            <input
              className="input"
              type="number"
              min={0}
              max={50}
              value={form.age}
              onChange={(e) => update('age', Number(e.target.value))}
              id="onboarding-age"
            />

            <label className="onboarding__label">Weight (kg)</label>
            <input
              className="input"
              type="number"
              min={0}
              max={500}
              step={0.1}
              value={form.weight}
              onChange={(e) => update('weight', Number(e.target.value))}
              id="onboarding-weight"
            />
          </>
        )}

        {step === 2 && (
          <>
            <h3>Health Profile for {form.name}</h3>
            <p className="onboarding__hint">
              Select any conditions or allergies, or use AI suggestions for tailored options.
            </p>

            <ContextualSelect
              species={form.species}
              customSpecies={form.customSpecies}
              selectedConditions={selectedConditions}
              selectedAllergies={selectedAllergies}
              onChangeConditions={setSelectedConditions}
              onChangeAllergies={setSelectedAllergies}
            />

            <label className="onboarding__label" style={{ marginTop: 'var(--space-md)' }}>
              Current Medications (comma separated)
            </label>
            <input
              className="input"
              placeholder="e.g. Apoquel 16mg daily, Flea drops"
              value={form.medications}
              onChange={(e) => update('medications', e.target.value)}
              id="onboarding-medications"
            />
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="onboarding__nav">
        {step === 0 ? (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft size={16} /> Back
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button type="button" className="btn btn-primary" onClick={handleNext}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={handleComplete}>
            <Check size={16} /> Save Pet
          </button>
        )}
      </div>
    </div>
  );
};
