import React from 'react';
import type { PetProfile } from '../../../schemas';

interface DispatchTriageFieldsProps {
  pets: PetProfile[];
  selectedPetId: string;
  setSelectedPetId: (id: string) => void;
  urgency: 'critical' | 'urgent' | 'standard';
  setUrgency: (urgency: 'critical' | 'urgent' | 'standard') => void;
  etaMinutes: number;
  setEtaMinutes: (eta: number) => void;
  symptoms: string;
  setSymptoms: (symptoms: string) => void;
  ownerName: string;
  setOwnerName: (name: string) => void;
  ownerPhone: string;
  setOwnerPhone: (phone: string) => void;
}

export const DispatchTriageFields: React.FC<DispatchTriageFieldsProps> = ({
  pets,
  selectedPetId,
  setSelectedPetId,
  urgency,
  setUrgency,
  etaMinutes,
  setEtaMinutes,
  symptoms,
  setSymptoms,
  ownerName,
  setOwnerName,
  ownerPhone,
  setOwnerPhone,
}) => {
  return (
    <>
      <div className="dispatch-form-group">
        <label>Select Pet for SOS Dossier</label>
        <select
          className="dispatch-select"
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(e.target.value)}
        >
          {pets.map((p) => (
            <option key={p._id || (p as any).id} value={p._id || (p as any).id}>
              🐾 {p.name} ({p.species} · {p.breed})
            </option>
          ))}
        </select>
      </div>

      <div className="dispatch-form-row">
        <div className="dispatch-form-group">
          <label>Estimated Arrival (ETA)</label>
          <select
            className="dispatch-select"
            value={etaMinutes}
            onChange={(e) => setEtaMinutes(Number(e.target.value))}
          >
            <option value={5}>⚡ 5 Minutes</option>
            <option value={10}>🚗 10 Minutes</option>
            <option value={15}>🚗 15 Minutes</option>
            <option value={30}>🚗 30 Minutes</option>
          </select>
        </div>

        <div className="dispatch-form-group">
          <label>Triage Severity Level</label>
          <select
            className="dispatch-select"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as any)}
          >
            <option value="critical">🚨 CRITICAL (Unconscious, Heavy Bleeding)</option>
            <option value="urgent">⚠️ URGENT (Poison, Seizure, Fractures)</option>
            <option value="standard">🟡 STABLE (Limping, Vomiting)</option>
          </select>
        </div>
      </div>

      <div className="dispatch-form-group">
        <label>Chief Complaint / Current Symptoms</label>
        <textarea
          rows={2}
          className="dispatch-textarea"
          placeholder="e.g. Ingested rat poison 15 mins ago, pale gums..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          required
        />
      </div>

      <div className="dispatch-form-row">
        <div className="dispatch-form-group">
          <label>Parent Name</label>
          <input
            type="text"
            className="dispatch-input"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
        </div>
        <div className="dispatch-form-group">
          <label>Emergency Phone</label>
          <input
            type="tel"
            className="dispatch-input"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            required
          />
        </div>
      </div>
    </>
  );
};
