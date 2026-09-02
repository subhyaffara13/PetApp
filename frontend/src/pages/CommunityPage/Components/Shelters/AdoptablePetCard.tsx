import { Phone } from 'lucide-react';

export interface AdoptablePetItem {
  _id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: string;
  gender: 'male' | 'female';
  avatar: string;
  shelterName: string;
  contactPhone?: string;
  shelterPhone?: string;
  story: string;
  status: 'available' | 'adopted';
}

interface AdoptablePetCardProps {
  pet: AdoptablePetItem;
}

export const AdoptablePetCard: React.FC<AdoptablePetCardProps> = ({ pet }) => {
  const phone = pet.contactPhone || pet.shelterPhone || '+972-3-555-0100';

  return (
    <div className="adoptable-pet-card card">
      <div className="adoptable-pet-photo-wrapper">
        <img src={pet.avatar} alt={pet.name} className="adoptable-pet-img" />
        <span className={`adoption-status-badge ${pet.status}`}>
          {pet.status === 'available' ? '❤️ Looking for Home' : '🎉 Adopted'}
        </span>
      </div>

      <div className="adoptable-pet-info">
        <div className="pet-title-row">
          <h4>{pet.name}</h4>
          <span className="pet-gender-age">
            {pet.gender === 'male' ? '♂ Male' : '♀ Female'} · {pet.age}
          </span>
        </div>

        <p className="pet-breed-tag">{pet.breed}</p>
        <p className="pet-story-preview">{pet.story}</p>
        <div className="pet-shelter-meta">
          <span>🏠 {pet.shelterName}</span>
        </div>

        <div className="adopt-card-actions">
          <a
            href={`tel:${phone}`}
            className="btn btn-primary btn-sm btn-adopt-contact"
          >
            <Phone size={14} /> Contact to Adopt
          </a>
        </div>
      </div>
    </div>
  );
};
