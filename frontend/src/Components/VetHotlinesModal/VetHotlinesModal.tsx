import { PhoneCall, X } from 'lucide-react';
import './VetHotlinesModal.css';

export interface Hotline {
  name: string;
  number: string;
  description: string;
}

export const DEFAULT_ISRAEL_HOTLINES: Hotline[] = [
  {
    name: 'Haifa Municipal Emergency Vet Service',
    number: '04-835-6450',
    description: '24/7 municipal veterinary dispatch for Haifa region',
  },
  {
    name: 'SPCA Israel 24/7 Animal Hotline',
    number: '*3703',
    description: 'National animal rescue and emergency vet advice',
  },
  {
    name: 'Israel Veterinary Medical Association Hotline',
    number: '03-960-4444',
    description: 'Direct line to on-call emergency veterinarians',
  },
  {
    name: 'National Animal Emergency Network',
    number: '*6900',
    description: 'Israel national animal welfare and medical triage',
  },
  {
    name: 'VetEmergency Israel 24/7',
    number: '*9080',
    description: 'Immediate advice from licensed emergency vets',
  },
];

interface VetHotlinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotlines?: Hotline[];
}

export const VetHotlinesModal = ({
  isOpen,
  onClose,
  hotlines = DEFAULT_ISRAEL_HOTLINES,
}: VetHotlinesModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="hotline-modal-overlay" onClick={onClose}>
      <div className="hotline-modal card" onClick={(e) => e.stopPropagation()}>
        <div className="hotline-modal__header">
          <h3>
            <PhoneCall size={18} /> Israel Free Vet Advice & Emergency Hotlines
          </h3>
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={onClose}
            aria-label="Close hotlines modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="hotline-modal__list">
          {hotlines.map((h, i) => (
            <div key={i} className="hotline-item">
              <div className="hotline-item__info">
                <h4>{h.name}</h4>
                <p>{h.description}</p>
              </div>
              <a href={`tel:${h.number}`} className="btn btn-primary btn-sm hotline-call-btn">
                📞 {h.number}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
