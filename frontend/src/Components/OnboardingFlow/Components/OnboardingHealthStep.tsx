import React from 'react';
import { ContextualSelect } from '../../ContextualSelect/ContextualSelect';

interface OnboardingHealthStepProps {
  species: string;
  customSpecies: string;
  selectedConditions: string[];
  setSelectedConditions: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAllergies: string[];
  setSelectedAllergies: React.Dispatch<React.SetStateAction<string[]>>;
  medications: string;
  onUpdate: (field: string, val: any) => void;
}

export const OnboardingHealthStep: React.FC<OnboardingHealthStepProps> = ({
  species,
  customSpecies,
  selectedConditions,
  setSelectedConditions,
  selectedAllergies,
  setSelectedAllergies,
  medications,
  onUpdate,
}) => {
  return (
    <div className="onboarding-step-body animate-fade-in">
      <ContextualSelect
        species={species}
        customSpecies={customSpecies}
        selectedConditions={selectedConditions}
        selectedAllergies={selectedAllergies}
        onChangeConditions={setSelectedConditions}
        onChangeAllergies={setSelectedAllergies}
      />

      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label htmlFor="meds">Current Medications (Optional)</label>
        <input
          id="meds"
          className="form-input"
          placeholder="e.g. Apoquel, Vetmedin (comma separated)"
          value={medications}
          onChange={(e) => onUpdate('medications', e.target.value)}
        />
      </div>
    </div>
  );
};
