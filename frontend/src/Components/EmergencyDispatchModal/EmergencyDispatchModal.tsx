import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Clinic, PetProfile } from '../../schemas';
import { Send, Clock, CheckCircle, X } from 'lucide-react';
import './EmergencyDispatchModal.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface EmergencyDispatchModalProps {
  clinic: Clinic;
  onClose: () => void;
}

export const EmergencyDispatchModal = ({ clinic, onClose }: EmergencyDispatchModalProps) => {
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [urgency, setUrgency] = useState<'critical' | 'urgent' | 'standard'>('urgent');
  const [symptoms, setSymptoms] = useState<string>('');
  const [etaMinutes, setEtaMinutes] = useState<number>(15);
  const [ownerName] = useState<string>('Subhi Y.');
  const [ownerPhone, setOwnerPhone] = useState<string>('+972-52-894-1234');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await axios.get(`${API_URL}/pet-profile`);
        if (res.data && res.data.length > 0) {
          setPets(res.data);
          setSelectedPetId(res.data[0]._id || res.data[0].id);
        }
      } catch {
        // Fallback demo pet
        const demoPets = [
          {
            _id: 'pet-rocky-1',
            name: 'Rocky',
            species: 'dog',
            breed: 'Golden Retriever',
            allergies: ['Penicillin'],
            knownConditions: ['Mild hip dysplasia'],
            medications: ['Glucosamine supplement'],
          },
        ];
        setPets(demoPets as any);
        setSelectedPetId('pet-rocky-1');
      }
    };
    fetchPets();
  }, []);

  const activePet = pets.find((p) => p._id === selectedPetId || (p as any).id === selectedPetId) || pets[0];

  const handleSendDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendError('');

    const payload = {
      petId: activePet ? activePet._id || (activePet as any).id : 'pet-1',
      petName: activePet ? activePet.name : 'Unknown Pet',
      species: activePet ? activePet.species : 'dog',
      breed: activePet ? activePet.breed : 'Mixed',
      ownerName,
      ownerPhone,
      clinicId: clinic.id || 'haifa-moriah-er',
      urgency,
      symptoms: symptoms || 'Accidental ingestion / severe trauma on way to ER',
      etaMinutes,
      allergies: activePet ? activePet.allergies : [],
      conditions: activePet ? activePet.knownConditions : [],
      medications: activePet ? activePet.medications : [],
    };

    try {
      await axios.post(`${API_URL}/clinic/dispatch`, payload);
      setSendError('');
      setIsSent(true);
    } catch {
      setSendError('Failed to transmit. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="dispatch-modal-overlay" onClick={onClose}>
      <div className="dispatch-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="dispatch-modal-header">
          <div className="dispatch-header-title">
            <span className="sos-icon-pulse">🚨</span>
            <div>
              <h3>Alert Clinic: I'm Coming</h3>
              <p>{clinic.name}</p>
            </div>
          </div>
          <button className="dispatch-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isSent ? (
          <div className="dispatch-success-view">
            <CheckCircle size={48} className="success-icon" />
            <h4>Emergency Dossier Transmitted!</h4>
            <p>
              <strong>{clinic.name}</strong> has received {activePet?.name}'s medical profile and is preparing triage.
            </p>
            <div className="success-eta-box">
              <Clock size={16} /> Estimated Arrival: <strong>~{etaMinutes} minutes</strong>
            </div>
            <button className="btn-done-dispatch" onClick={onClose}>
              Return to Map & Directions
            </button>
          </div>
        ) : (
          <form onSubmit={handleSendDispatch} className="dispatch-form">
            <div className="dispatch-field">
              <label>Select Pet in Distress</label>
              <select
                className="dispatch-select"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
              >
                {pets.map((p) => (
                  <option key={p._id || (p as any).id} value={p._id || (p as any).id}>
                    🐾 {p.name} ({p.breed})
                  </option>
                ))}
              </select>
            </div>

            {activePet && (
              <div className="pet-pre-summary">
                <span className="pre-label">Auto-transmitting Medical Records:</span>
                <div className="pre-tags">
                  <span className="pre-tag">Allergies: {activePet.allergies?.length ? activePet.allergies.join(', ') : 'None'}</span>
                  <span className="pre-tag">Conditions: {activePet.knownConditions?.length ? activePet.knownConditions.join(', ') : 'None'}</span>
                </div>
              </div>
            )}

            <div className="dispatch-field">
              <label>Urgency Level</label>
              <div className="urgency-selector">
                <button
                  type="button"
                  className={`urgency-opt urgency-opt--critical ${urgency === 'critical' ? 'urgency-opt--selected' : ''}`}
                  onClick={() => setUrgency('critical')}
                >
                  🔴 Critical / Shock
                </button>
                <button
                  type="button"
                  className={`urgency-opt urgency-opt--urgent ${urgency === 'urgent' ? 'urgency-opt--selected' : ''}`}
                  onClick={() => setUrgency('urgent')}
                >
                  🟡 Urgent Bleeding/Trauma
                </button>
                <button
                  type="button"
                  className={`urgency-opt urgency-opt--standard ${urgency === 'standard' ? 'urgency-opt--selected' : ''}`}
                  onClick={() => setUrgency('standard')}
                >
                  🔵 Moderate Distress
                </button>
              </div>
            </div>

            <div className="dispatch-field">
              <label>Symptoms / What Happened?</label>
              <textarea
                className="dispatch-textarea"
                rows={2}
                required
                placeholder="e.g. Swallowed dark chocolate 20 mins ago, panting and vomiting..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>

            <div className="dispatch-row">
              <div className="dispatch-field">
                <label>ETA (Minutes)</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  className="dispatch-input"
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(Number(e.target.value))}
                />
              </div>
              <div className="dispatch-field">
                <label>Owner Phone</label>
                <input
                  type="tel"
                  required
                  className="dispatch-input"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="dispatch-footer">
              <button type="button" className="btn-cancel-dispatch" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-transmit-sos" disabled={isSending}>
                <Send size={15} /> {isSending ? 'Transmitting...' : "Transmit Dossier to Clinic"}
              </button>
            </div>
            {sendError && <p className="dispatch-error" style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.5rem 0 0', textAlign: 'center' }}>{sendError}</p>}
          </form>
        )}
      </div>
    </div>
  );
};
