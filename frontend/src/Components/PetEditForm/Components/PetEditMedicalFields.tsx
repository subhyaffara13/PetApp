import React from 'react';

interface PetEditMedicalFieldsProps {
  knownConditions: string;
  allergies: string;
  medications: string;
  onUpdate: (field: string, val: any) => void;
}

export const PetEditMedicalFields: React.FC<PetEditMedicalFieldsProps> = ({
  knownConditions,
  allergies,
  medications,
  onUpdate,
}) => {
  return (
    <>
      <div className="form-group">
        <label htmlFor="edit-conditions">Chronic Medical Conditions (comma-separated)</label>
        <input
          id="edit-conditions"
          type="text"
          className="form-input"
          placeholder="e.g. Epilepsy, Diabetes, Arthritis"
          value={knownConditions}
          onChange={(e) => onUpdate('knownConditions', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="edit-allergies">Allergies (comma-separated)</label>
        <input
          id="edit-allergies"
          type="text"
          className="form-input"
          placeholder="e.g. Penicillin, Chicken protein, Bee stings"
          value={allergies}
          onChange={(e) => onUpdate('allergies', e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="edit-meds">Current Medications (comma-separated)</label>
        <input
          id="edit-meds"
          type="text"
          className="form-input"
          placeholder="e.g. Apoquel 16mg, Prednisone"
          value={medications}
          onChange={(e) => onUpdate('medications', e.target.value)}
        />
      </div>
    </>
  );
};
