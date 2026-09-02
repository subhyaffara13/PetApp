import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import type { PetProfile } from '../../schemas';
import { validateProfanity } from '../../functions/profanityFilter';
import { getBreedsForSpecies } from '../../data/petBreeds';
import { OnboardingBasicsStep } from './Components/OnboardingBasicsStep';
import { OnboardingDetailsStep } from './Components/OnboardingDetailsStep';
import { OnboardingHealthStep } from './Components/OnboardingHealthStep';
import './OnboardingFlow.css';

interface OnboardingFlowProps {
  onComplete: (pet: Omit<PetProfile, '_id' | 'createdAt' | 'updatedAt' | 'medicalHistory'>) => void;
  onCancel: () => void;
}

const STEPS = ['Basics', 'Details', 'Health'];

export const OnboardingFlow = ({ onComplete, onCancel }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [isCustomBreed, setIsCustomBreed] = useState(false);
  const [form, setForm] = useState({
    name: '',
    species: 'dog' as PetProfile['species'],
    customSpecies: '',
    breed: 'Golden Retriever',
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

  const handleSpeciesSelect = (newSpecies: PetProfile['species']) => {
    const breeds = getBreedsForSpecies(newSpecies);
    setForm((prev) => ({
      ...prev,
      species: newSpecies,
      breed: breeds[0] || 'Mixed Breed',
    }));
    setIsCustomBreed(false);
    setValidationError(null);
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

  const handleNext = () => {
    if (step === 0) {
      if (!form.name.trim()) return setValidationError('Please enter a pet name.');
      const profanity = validateProfanity(form.name);
      if (!profanity.isValid) return setValidationError(profanity.error || 'Inappropriate pet name.');
      if (form.species === 'other' && !form.customSpecies.trim()) return setValidationError('Please specify the animal species.');
    }
    if (step === 1) {
      if (!form.breed.trim()) return setValidationError('Please enter a breed or type.');
      const profanity = validateProfanity(form.breed);
      if (!profanity.isValid) return setValidationError(profanity.error || 'Inappropriate breed.');
    }
    setValidationError(null);
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleSubmit = () => {
    onComplete({
      name: form.name.trim(),
      species: form.species,
      breed: form.species === 'other' && form.customSpecies.trim() ? `${form.customSpecies.trim()} (${form.breed.trim()})` : form.breed.trim(),
      age: form.age,
      weight: form.weight,
      gender: form.gender,
      knownConditions: selectedConditions,
      allergies: selectedAllergies,
      medications: form.medications.split(',').map((s) => s.trim()).filter(Boolean),
      photoUrl: `https://images.unsplash.com/photo-${form.species === 'cat' ? '1514888286974-6c03e2ca1dba' : '1543466835-00a7907e9de1'}?w=200`,
    });
  };

  return (
    <div className="onboarding-overlay" onClick={onCancel}>
      <div className="onboarding-card card" onClick={(e) => e.stopPropagation()}>
        <div className="onboarding-progress">
          {STEPS.map((label, idx) => (
            <div key={label} className={`progress-step ${idx <= step ? 'active' : ''} ${idx < step ? 'completed' : ''}`}>
              <div className="step-circle">{idx < step ? <Check size={14} /> : idx + 1}</div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>

        {validationError && (
          <div className="onboarding-error-banner animate-shake">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}

        {step === 0 && (
          <OnboardingBasicsStep
            name={form.name}
            species={form.species}
            customSpecies={form.customSpecies}
            onUpdate={update}
            onSpeciesSelect={handleSpeciesSelect}
          />
        )}
        {step === 1 && (
          <OnboardingDetailsStep
            species={form.species}
            breed={form.breed}
            isCustomBreed={isCustomBreed}
            age={form.age}
            weight={form.weight}
            gender={form.gender}
            onUpdate={update}
            onBreedChange={handleBreedChange}
          />
        )}
        {step === 2 && (
          <OnboardingHealthStep
            species={form.species}
            customSpecies={form.customSpecies}
            selectedConditions={selectedConditions}
            setSelectedConditions={setSelectedConditions}
            selectedAllergies={selectedAllergies}
            setSelectedAllergies={setSelectedAllergies}
            medications={form.medications}
            onUpdate={update}
          />
        )}

        <div className="onboarding-actions">
          {step > 0 ? (
            <button className="btn btn-secondary btn-sm" onClick={() => setStep((s) => s - 1)}>
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
          )}

          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary btn-sm" onClick={handleNext}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
              <Check size={16} /> Create Passport
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
