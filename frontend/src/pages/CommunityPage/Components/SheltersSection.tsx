import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, Phone, Globe, Home, Loader2, ChevronDown, ChevronUp, MessageCircle, Plus, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useImageUpload } from '../../../Hooks/useImageUpload';
import { SPECIES_OPTIONS, getBreedsForSpecies } from '../../../data/petBreeds';
import { API_URL } from '../../../config/api';

interface ShelterResult {
  id: string;
  name: string;
  address: string;
  country: string;
  countryCode: string;
  location: { lat: number; lng: number };
  phone: string | null;
  website: string | null;
  rating?: number;
  distanceKm?: number;
}

interface AdoptablePetItem {
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

interface SheltersSectionProps {
  activeCategory: string;
  onGoToAdoption: () => void;
  onGoToAll: () => void;
}

export const SheltersSection: React.FC<SheltersSectionProps> = ({
  activeCategory,
  onGoToAdoption,
  onGoToAll,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { showToast } = useToast();
  const { image, handleFileChange, clearImage } = useImageUpload('posts');

  const [shelters, setShelters] = useState<ShelterResult[]>([]);
  const [adoptablePets, setAdoptablePets] = useState<AdoptablePetItem[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Auto-expand when user filters by adoption
  useEffect(() => {
    if (activeCategory === 'adoption') {
      setIsCollapsed(false);
    }
  }, [activeCategory]);

  // New Pet Form State
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'dog' | 'cat' | 'other'>('dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetAge, setNewPetAge] = useState('');
  const [newPetGender, setNewPetGender] = useState<'male' | 'female'>('female');
  const [newPetShelter, setNewPetShelter] = useState('SOS Pets Israel');
  const [newPetPhone, setNewPetPhone] = useState('+972-4-838-8900');
  const [newPetStory, setNewPetStory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Automatically determine user country & nearby shelters
  useEffect(() => {
    const detectCountryAndFetchShelters = async () => {
      setLoading(true);
      let detectedCountry = 'israel';

      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz.includes('Jerusalem') || tz.includes('Tel_Aviv') || tz.includes('Asia/Gaza')) {
          detectedCountry = 'israel';
        } else if (tz.includes('America') || tz.includes('New_York') || tz.includes('Los_Angeles')) {
          detectedCountry = 'united states';
        } else if (tz.includes('London') || tz.includes('Europe/London')) {
          detectedCountry = 'united kingdom';
        } else if (tz.includes('Europe')) {
          detectedCountry = 'germany';
        }
      } catch {}

      try {
        const res = await axios.get<ShelterResult[]>(`${API_URL}/community/shelters/nearby`, {
          params: { country: detectedCountry },
        });
        setShelters(res.data || []);
      } catch {
        setShelters([]);
      } finally {
        setLoading(false);
      }
    };

    detectCountryAndFetchShelters();
  }, []);

  // Fetch adoptable pets from database
  useEffect(() => {
    const fetchAdoptablePets = async () => {
      try {
        const res = await axios.get<AdoptablePetItem[]>(`${API_URL}/community/adoptable-pets`, {
          params: { species: selectedSpecies },
        });
        setAdoptablePets(res.data || []);
      } catch {
        setAdoptablePets([]);
      }
    };

    if (activeCategory === 'adoption') {
      fetchAdoptablePets();
    }
  }, [activeCategory, selectedSpecies]);

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim() || !newPetBreed.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/community/adoptable-pets`, {
        name: newPetName,
        species: newPetSpecies,
        breed: newPetBreed,
        age: newPetAge || 'Young',
        gender: newPetGender,
        avatar: (image?.url || image?.previewUrl) || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
        shelterName: newPetShelter,
        contactPhone: newPetPhone,
        story: newPetStory,
        status: 'available',
      });

      setAdoptablePets((prev) => [res.data, ...prev]);
      setShowAddModal(false);
      clearImage();
      setNewPetName('');
      setNewPetBreed('');
      setNewPetStory('');
      showToast('Rescue pet listed for adoption!', 'success', '🏡 Listed for Adoption');
    } catch {
      showToast('Failed to list adoptable pet.', 'error', '❌ Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="shelters-section card animate-slide-up" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Collapsible Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}
        >
          <span style={{ fontSize: '1.2rem' }}>🏡</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {activeCategory === 'adoption' ? 'Live Pet Adoption Directory' : 'Local Shelters & Rescues'}
            </h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
              {isCollapsed
                ? `${shelters.length > 0 ? `${shelters.length} centers nearby` : 'Find rescue centers'} · Click to expand`
                : activeCategory === 'adoption'
                ? 'Find loving rescue pets looking for a forever home'
                : 'Verified rescue organizations & animal shelters in your region'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#38bdf8' }}
          >
            {isCollapsed ? <><ChevronDown size={14} /> Expand</> : <><ChevronUp size={14} /> Collapse</>}
          </button>
        </div>
      </div>

      {/* Expanded Content View */}
      {!isCollapsed && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn-adopt-banner"
              onClick={() => (activeCategory === 'adoption' ? onGoToAll() : onGoToAdoption())}
              style={{
                padding: '0.35rem 0.7rem',
                background: activeCategory === 'adoption' ? 'rgba(255,255,255,0.08)' : 'var(--color-primary)',
                color: activeCategory === 'adoption' ? '#f8fafc' : '#0f172a',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {activeCategory === 'adoption' ? '← View Shelters' : '🐾 Browse Adoptable Pets'}
            </button>

            {activeCategory === 'adoption' && (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast('Please sign in to list a rescue pet', 'info', '🔒 Sign In Required');
                    openAuthModal('/community');
                    return;
                  }
                  setShowAddModal(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0.35rem 0.7rem',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Plus size={13} /> List Rescue Pet
              </button>
            )}
          </div>

          {/* ADOPTION VIEW vs SHELTERS VIEW */}
          {activeCategory === 'adoption' ? (
            <div>
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
            {(['all', 'dog', 'cat'] as const).map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSelectedSpecies(sp)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: selectedSpecies === sp ? '#38bdf8' : 'rgba(255,255,255,0.12)',
                  background: selectedSpecies === sp ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                  color: selectedSpecies === sp ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {sp === 'all' && '🐾 All Adoptable'}
                {sp === 'dog' && '🐶 Dogs'}
                {sp === 'cat' && '🐱 Cats'}
              </button>
            ))}
          </div>

          {/* Adoptable Pets Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1rem',
            }}
          >
            {adoptablePets.map((pet) => (
              <div
                key={pet._id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ position: 'relative', paddingTop: '70%' }}>
                  <img
                    src={pet.avatar}
                    alt={pet.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(16,185,129,0.9)',
                      color: '#fff',
                      borderRadius: 12,
                      padding: '2px 8px',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {pet.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{pet.name}</strong>
                    <span style={{ color: '#38bdf8', fontSize: '0.74rem', fontWeight: 700 }}>{pet.age}</span>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.74rem', marginBottom: '0.4rem', display: 'block' }}>
                    {pet.breed} · {pet.gender === 'female' ? '♀ Female' : '♂ Male'}
                  </span>
                  <p style={{ margin: '0 0 0.75rem', color: '#cbd5e1', fontSize: '0.76rem', lineHeight: 1.35, flex: 1 }}>
                    {pet.story}
                  </p>

                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: 'auto' }}>
                    {(() => {
                      const phoneNum = (pet.contactPhone || pet.shelterPhone || '+972-4-838-8900');
                      return (
                        <>
                          <a
                            href={`tel:${phoneNum.replace(/\s/g, '')}`}
                            style={{
                              flex: 1,
                              padding: '0.4rem',
                              background: 'rgba(255,255,255,0.08)',
                              color: '#f8fafc',
                              borderRadius: 6,
                              textAlign: 'center',
                              textDecoration: 'none',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px',
                            }}
                          >
                            <Phone size={11} /> Call
                          </a>
                          <a
                            href={`https://wa.me/${phoneNum.replace(/\D/g, '')}?text=Hi! I am interested in adopting ${pet.name} from PetSOS.`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              flex: 1,
                              padding: '0.4rem',
                              background: '#25D366',
                              color: '#0f172a',
                              borderRadius: 6,
                              textAlign: 'center',
                              textDecoration: 'none',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px',
                            }}
                          >
                            <MessageCircle size={11} /> WhatsApp
                          </a>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* SHELTERS DIRECTORY VIEW (Auto-Located) */
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <Loader2 size={22} className="spin" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Locating verified shelters in your area...</p>
            </div>
          ) : (
            <div className="shelters-grid">
              {shelters.map((s) => (
                <div className="shelter-card" key={s.id}>
                  <div className="shelter-card-top">
                    <span className="shelter-pin"><Home size={14} /></span>
                    <strong className="shelter-name">{s.name}</strong>
                  </div>
                  <div className="shelter-meta">
                    <span><MapPin size={13} /> {s.address}</span>
                  </div>
                  <div className="shelter-actions">
                    {s.phone && (
                      <a className="shelter-action-btn" href={`tel:${s.phone.replace(/\s/g, '')}`}>
                        <Phone size={13} /> Call
                      </a>
                    )}
                    {s.website && (
                      <a className="shelter-action-btn" href={s.website} target="_blank" rel="noreferrer">
                        <Globe size={13} /> Visit
                      </a>
                    )}
                    <a
                      className="shelter-action-btn"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} ${s.address}`)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MapPin size={13} /> Map
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
        </div>
      )}

      {/* Shelter Manager Add Pet Modal */}
      {showAddModal && (
        <div className="auth-modal-overlay" onClick={() => setShowAddModal(false)} style={{ zIndex: 1100 }}>
          <div className="auth-modal card animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460, padding: '1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.05rem', fontWeight: 800 }}>+ Add Adoptable Rescue Pet</h3>
              <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePet} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Pet Name</label>
                <input type="text" value={newPetName} onChange={(e) => setNewPetName(e.target.value)} required style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, padding: '0.45rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '130px' }}>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>1. Species</label>
                  <select
                    value={newPetSpecies}
                    onChange={(e) => {
                      const sp = e.target.value as any;
                      setNewPetSpecies(sp);
                      const breeds = getBreedsForSpecies(sp);
                      setNewPetBreed(breeds[0] || 'Mixed');
                    }}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, padding: '0.45rem' }}
                  >
                    {SPECIES_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.emoji} {opt.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>2. Breed</label>
                  <select
                    value={newPetBreed}
                    onChange={(e) => setNewPetBreed(e.target.value)}
                    style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, padding: '0.45rem' }}
                  >
                    {getBreedsForSpecies(newPetSpecies).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Age</label>
                  <input type="text" value={newPetAge} onChange={(e) => setNewPetAge(e.target.value)} placeholder="e.g. 2 years" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, padding: '0.45rem' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Gender</label>
                  <select value={newPetGender} onChange={(e) => setNewPetGender(e.target.value as any)} style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, padding: '0.45rem' }}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Rescue Shelter Name</label>
                <input type="text" value={newPetShelter} onChange={(e) => setNewPetShelter(e.target.value)} required style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, padding: '0.45rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Shelter Inquiry Phone / WhatsApp</label>
                <input type="text" value={newPetPhone} onChange={(e) => setNewPetPhone(e.target.value)} required style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, padding: '0.45rem' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Photo (Cloudinary Upload)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', color: '#94a3b8', fontSize: '0.8rem' }} />
                {(image?.previewUrl || image?.url) && <img src={image?.previewUrl || image?.url} alt="preview" style={{ width: 60, height: 60, borderRadius: 6, objectFit: 'cover', marginTop: 4 }} />}
              </div>

              <div>
                <label style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Rescue Story & Personality</label>
                <textarea value={newPetStory} onChange={(e) => setNewPetStory(e.target.value)} rows={2} placeholder="Explain how they were rescued, temperament, and ideal home..." style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 6, padding: '0.45rem' }} />
              </div>

              <button type="submit" disabled={isSubmitting} style={{ padding: '0.65rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer', marginTop: '0.35rem' }}>
                {isSubmitting ? 'Publishing...' : 'Publish Rescue Pet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
