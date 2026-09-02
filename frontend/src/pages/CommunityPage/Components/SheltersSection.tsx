import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Home, ChevronDown, ChevronUp, Plus, Heart } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { AdoptablePetCard, type AdoptablePetItem } from './Shelters/AdoptablePetCard';
import { ShelterDirectoryCard, type ShelterResult } from './Shelters/ShelterDirectoryCard';
import { ShelterDonationModal } from './Shelters/ShelterDonationModal';
import { AddAdoptablePetModal } from './Shelters/AddAdoptablePetModal';
import { API_URL } from '../../../config/api';

interface SheltersSectionProps {
  activeCategory: string;
  onGoToAdoption: () => void;
  onGoToAll: () => void;
}

export const SheltersSection: React.FC<SheltersSectionProps> = ({
  activeCategory,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [shelters, setShelters] = useState<ShelterResult[]>([]);
  const [adoptablePets, setAdoptablePets] = useState<AdoptablePetItem[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [donationShelter, setDonationShelter] = useState<ShelterResult | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (activeCategory === 'adoption') setIsCollapsed(false);
  }, [activeCategory]);

  const fetchSheltersAndPets = async () => {
    try {
      const [sheltersRes, petsRes] = await Promise.all([
        axios.get<ShelterResult[]>(`${API_URL}/adoption/shelters`),
        axios.get<AdoptablePetItem[]>(`${API_URL}/adoption/pets`),
      ]);
      setShelters(sheltersRes.data || []);
      setAdoptablePets(petsRes.data || []);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchSheltersAndPets();
  }, []);

  const filteredPets = adoptablePets.filter(
    (p) => selectedSpecies === 'all' || p.species === selectedSpecies
  );

  return (
    <div className="shelters-section-container card">
      <div className="shelters-section-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="shelters-header-title">
          <div className="shelters-icon-badge">
            <Heart size={20} color="#ec4899" fill="#ec4899" />
          </div>
          <div>
            <h3>Rescue Shelters & Adoption Hub</h3>
            <p className="shelters-subtitle">
              Verified local non-profits, adoptable pets & direct emergency medical aid
            </p>
          </div>
        </div>

        <div className="shelters-header-controls">
          <button
            type="button"
            className="btn btn-primary btn-sm btn-list-pet"
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) openAuthModal();
              else setShowAddModal(true);
            }}
          >
            <Plus size={14} /> List Pet for Adoption
          </button>
          <button type="button" className="btn-collapse-toggle">
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="shelters-section-body animate-slide-down">
          <div className="shelters-filter-row">
            <div className="species-filter-pills">
              <button
                className={`pill-btn ${selectedSpecies === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedSpecies('all')}
              >
                All Pets ({adoptablePets.length})
              </button>
              <button
                className={`pill-btn ${selectedSpecies === 'dog' ? 'active' : ''}`}
                onClick={() => setSelectedSpecies('dog')}
              >
                🐕 Dogs
              </button>
              <button
                className={`pill-btn ${selectedSpecies === 'cat' ? 'active' : ''}`}
                onClick={() => setSelectedSpecies('cat')}
              >
                🐈 Cats
              </button>
            </div>
          </div>

          <div className="adoptable-pets-grid">
            {filteredPets.map((pet) => (
              <AdoptablePetCard key={pet._id} pet={pet} />
            ))}
          </div>

          <div className="shelters-directory-heading">
            <Home size={18} color="#f97316" />
            <h4>Registered Local Rescue Shelters ({shelters.length})</h4>
          </div>

          <div className="shelters-directory-grid">
            {shelters.map((shelter) => (
              <ShelterDirectoryCard
                key={shelter.id}
                shelter={shelter}
                onOpenDonation={(s) => setDonationShelter(s)}
              />
            ))}
          </div>
        </div>
      )}

      <ShelterDonationModal
        shelter={donationShelter}
        onClose={() => setDonationShelter(null)}
      />

      <AddAdoptablePetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchSheltersAndPets}
      />
    </div>
  );
};
