import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Clinic, PetProfile } from '../../schemas';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { Send, CheckCircle, X } from 'lucide-react';
import { DispatchTriageFields } from './Components/DispatchTriageFields';
import { API_URL } from '../../config/api';
import './EmergencyDispatchModal.css';

interface EmergencyDispatchModalProps {
  clinic: Clinic | null;
  isOpen?: boolean;
  onClose: () => void;
  userLocation?: { lat: number; lon: number };
}

export const EmergencyDispatchModal = ({ clinic, isOpen = true, onClose }: EmergencyDispatchModalProps) => {
  if (!clinic || !isOpen) return null;

  const { user, accessToken } = useAuth();
  const { t } = useTranslation();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [urgency, setUrgency] = useState<'critical' | 'urgent' | 'standard'>('urgent');
  const [symptoms, setSymptoms] = useState<string>('');
  const [etaMinutes, setEtaMinutes] = useState<number>(15);
  const [ownerName, setOwnerName] = useState<string>(user?.name || '');
  const [ownerPhone, setOwnerPhone] = useState<string>(() => localStorage.getItem('petsos_user_phone') || '054-123-4567');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    if (user?.name && !ownerName) setOwnerName(user.name);
  }, [user, ownerName]);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const res = await axios.get(`${API_URL}/pet-profile`, { headers });
        if (res.data && res.data.length > 0) {
          setPets(res.data);
          setSelectedPetId(res.data[0]._id || res.data[0].id);
        }
      } catch (err) {
        console.warn('Could not fetch active pets:', err);
      }
    };
    fetchPets();
  }, [accessToken]);

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
      clinicId: clinic.id || 'haifa-er',
      urgency,
      symptoms: symptoms || 'Emergency intake request',
      etaMinutes,
      allergies: activePet ? activePet.allergies : [],
      conditions: activePet ? activePet.knownConditions : [],
      medications: activePet ? activePet.medications : [],
    };

    try {
      await axios.post(`${API_URL}/clinic/dispatch`, payload);
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
              <h3>{t('emergency.btn_alert_coming', "Alert Clinic: I'm Coming")}</h3>
              <p>{clinic.name}</p>
            </div>
          </div>
          <button className="dispatch-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {isSent ? (
          <div className="dispatch-success-view animate-fade-in">
            <CheckCircle size={48} color="#10b981" />
            <h4>Dossier Dispatched to ER Desk!</h4>
            <p>The veterinary staff has been notified of your ETA ({etaMinutes} min) and is preparing intake.</p>
            <button className="btn btn-primary" onClick={onClose}>Close & Drive Safely</button>
          </div>
        ) : (
          <form onSubmit={handleSendDispatch} className="dispatch-form">
            {sendError && <div className="dispatch-error-banner">{sendError}</div>}
            <DispatchTriageFields
              pets={pets}
              selectedPetId={selectedPetId}
              setSelectedPetId={setSelectedPetId}
              urgency={urgency}
              setUrgency={setUrgency}
              etaMinutes={etaMinutes}
              setEtaMinutes={setEtaMinutes}
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              ownerName={ownerName}
              setOwnerName={setOwnerName}
              ownerPhone={ownerPhone}
              setOwnerPhone={setOwnerPhone}
            />
            <div className="dispatch-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-danger btn-send-dispatch" disabled={isSending}>
                {isSending ? 'Transmitting Dossier...' : <><Send size={16} /> Transmit Emergency Dossier</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
