import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Phone, MapPin } from 'lucide-react';
import './EmergencyCard.css';

interface EmergencyCardProps {
  message?: string;
}

const VET_HOTLINE = 'tel:+1800VETHELP';

export const EmergencyCard = ({ message }: EmergencyCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="emergency-card animate-slide-up" id="emergency-card">
      <div className="emergency-card__icon">
        <AlertTriangle size={28} />
      </div>

      <h3 className="emergency-card__title">This sounds like an emergency</h3>

      {message && (
        <p className="emergency-card__message">{message}</p>
      )}

      <p className="emergency-card__disclaimer">
        I'm not able to provide medical advice. Please contact a veterinarian immediately.
      </p>

      <div className="emergency-card__actions">
        <a href={VET_HOTLINE} className="btn btn-danger btn-lg emergency-card__btn">
          <Phone size={18} />
          Call 24/7 Vet Hotline
        </a>
        <button
          className="btn btn-primary btn-lg emergency-card__btn"
          onClick={() => navigate('/')}
        >
          <MapPin size={18} />
          Find Emergency Vet
        </button>
      </div>
    </div>
  );
};
