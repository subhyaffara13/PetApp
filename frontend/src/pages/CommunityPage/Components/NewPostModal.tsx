import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ImagePlus, Video, X, Loader2, Sparkles, Check, AtSign } from 'lucide-react';
import { useImageUpload } from '../../../Hooks/useImageUpload';
import { SPECIES_OPTIONS, getBreedsForSpecies } from '../../../data/petBreeds';
import { API_URL } from '../../../config/api';
import type { PetProfile } from '../../../schemas';

const PRESET_SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=800&auto=format&fit=crop&q=80',
];

interface NewPostModalProps {
  isOpen: boolean;
  postMode: 'feed' | 'story';
  setPostMode: (mode: 'feed' | 'story') => void;
  selectedPetName: string;
  setSelectedPetName: (val: string) => void;
  selectedPetBreed: string;
  setSelectedPetBreed: (val: string) => void;
  newPostCategory: 'cute' | 'playdate' | 'lost_found' | 'health_tip' | 'adoption';
  setNewPostCategory: (val: 'cute' | 'playdate' | 'lost_found' | 'health_tip' | 'adoption') => void;
  newPostImage: string;
  setNewPostImage: (val: string) => void;
  newPostLocation: string;
  setNewPostLocation: (val: string) => void;
  newPostCaption: string;
  setNewPostCaption: (val: string) => void;
  contactPhone: string;
  setContactPhone: (val: string) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen, postMode, setPostMode,
  selectedPetName, setSelectedPetName,
  selectedPetBreed, setSelectedPetBreed,
  newPostCategory, setNewPostCategory,
  newPostImage, setNewPostImage,
  newPostLocation, setNewPostLocation,
  newPostCaption, setNewPostCaption,
  contactPhone, setContactPhone,
  isSubmitting, onClose, onSubmit,
}) => {
  const { image, isUploading, uploadError, openPicker, clearImage, handleFileChange, inputRef } = useImageUpload('posts');
  const [userPets, setUserPets] = useState<PetProfile[]>([]);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [mentionedPets, setMentionedPets] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('dog');
  const [isCustomBreed, setIsCustomBreed] = useState(false);
  const [isCustomPetMode, setIsCustomPetMode] = useState(false);

  // Fetch user's registered pets from database
  useEffect(() => {
    if (!isOpen) return;
    const fetchUserPets = async () => {
      try {
        const res = await axios.get<PetProfile[]>(`${API_URL}/pet-profile`);
        if (res.data && res.data.length > 0) {
          setUserPets(res.data);
          const firstPet = res.data[0];
          setSelectedPetIds([firstPet._id || 'pet-0']);
          setSelectedPetName(firstPet.name);
          setSelectedPetBreed(firstPet.breed);
          setSelectedSpecies(firstPet.species || 'dog');
          if (firstPet.photoUrl && !newPostImage) {
            setNewPostImage(firstPet.photoUrl);
          }
          setIsCustomPetMode(false);
        } else {
          setIsCustomPetMode(true);
        }
      } catch (err) {
        console.warn('Could not load user pets', err);
        setIsCustomPetMode(true);
      }
    };
    fetchUserPets();
  }, [isOpen]);

  const togglePetSelection = (pet: PetProfile) => {
    const id = pet._id || pet.name;
    const exists = selectedPetIds.includes(id);
    let nextIds: string[];
    if (exists) {
      nextIds = selectedPetIds.filter((pId) => pId !== id);
    } else {
      nextIds = [...selectedPetIds, id];
    }
    setSelectedPetIds(nextIds);

    const selectedPets = userPets.filter((p) => nextIds.includes(p._id || p.name));
    if (selectedPets.length > 0) {
      setSelectedPetName(selectedPets.map((p) => p.name).join(', '));
      setSelectedPetBreed(selectedPets.map((p) => p.breed).join(', '));
      setSelectedSpecies(selectedPets[0].species || 'dog');
      if (selectedPets[0].photoUrl && !image?.url) {
        setNewPostImage(selectedPets[0].photoUrl);
      }
    } else {
      setSelectedPetName('');
    }
  };

  const handleSpeciesChange = (newSpecies: string) => {
    setSelectedSpecies(newSpecies);
    const breeds = getBreedsForSpecies(newSpecies);
    const firstBreed = breeds[0] || 'Mixed Breed';
    setSelectedPetBreed(firstBreed);
    setIsCustomBreed(false);
  };

  const handleBreedSelect = (val: string) => {
    if (val === '__custom__') {
      setIsCustomBreed(true);
      setSelectedPetBreed('');
    } else {
      setIsCustomBreed(false);
      setSelectedPetBreed(val);
    }
  };

  // Sync Cloudinary URL up to parent when upload completes
  useEffect(() => {
    if (image?.url) setNewPostImage(image.url);
  }, [image?.url]);

  if (!isOpen) return null;

  const currentBreeds = getBreedsForSpecies(selectedSpecies);
  const isVideoUrl = Boolean(
    newPostImage?.match(/\.(mp4|webm|mov|ogg)($|\?)/i) ||
    Boolean(inputRef.current?.files?.[0]?.type?.startsWith('video/'))
  );

  return (
    <div className="post-studio-takeover animate-fade-in" id="new-post-studio">
      <div className="post-studio-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose} title="Close">
            <X size={18} />
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              {postMode === 'story' ? '⚡ Create 24h Story' : '✍️ Create Community Post'}
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              {postMode === 'story' ? 'Visible to neighbors for 24 hours' : 'Shares with your local neighborhood community'}
            </span>
          </div>
        </div>

        <button type="button" className="btn-close" onClick={onClose}>✕</button>
      </div>

      <div className="post-studio-body">
        <form onSubmit={onSubmit} className="new-post-form">
          <div className="post-mode-toggle" style={{ marginBottom: '1.25rem' }}>
            <button type="button" className={`mode-btn ${postMode === 'feed' ? 'mode-btn--active' : ''}`} onClick={() => setPostMode('feed')}>
              📰 Feed Post
            </button>
            <button type="button" className={`mode-btn ${postMode === 'story' ? 'mode-btn--active' : ''}`} onClick={() => setPostMode('story')}>
              ⚡ Story (24h Expire)
            </button>
          </div>

          {/* ── Pet Selection: Multi-Pet Dropdown / Chips ── */}
          {userPets.length > 0 && !isCustomPetMode ? (
            <div className="form-group" style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', padding: '0.85rem', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
                  <Sparkles size={14} /> Select Pets in this Post
                </label>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => setIsCustomPetMode(true)}
                  style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}
                >
                  + Other Animal
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {userPets.map((p) => {
                  const id = p._id || p.name;
                  const isSelected = selectedPetIds.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => togglePetSelection(p)}
                      style={{
                        padding: '0.45rem 0.8rem',
                        borderRadius: 20,
                        border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                        background: isSelected ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)',
                        color: isSelected ? '#38bdf8' : 'var(--color-text-secondary)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected && <Check size={13} />}
                      <span>🐾 {p.name}</span>
                      <small style={{ opacity: 0.7, fontSize: '0.72rem' }}>({p.breed})</small>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Species and Breed picker for custom pet */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>1. Kind of Animal (Species)</label>
                  {userPets.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => setIsCustomPetMode(false)}
                      style={{ color: '#38bdf8', fontSize: '0.75rem' }}
                    >
                      Select my pets instead
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginTop: '0.25rem' }}>
                  {SPECIES_OPTIONS.map((sp) => (
                    <button
                      key={sp.value}
                      type="button"
                      onClick={() => handleSpeciesChange(sp.value)}
                      style={{
                        padding: '0.45rem 0.3rem',
                        borderRadius: 8,
                        border: selectedSpecies === sp.value ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                        background: selectedSpecies === sp.value ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.03)',
                        color: selectedSpecies === sp.value ? '#38bdf8' : '#cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <span>{sp.emoji}</span> {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>2. Breed / Variant</label>
                <select
                  className="input"
                  value={isCustomBreed ? '__custom__' : selectedPetBreed}
                  onChange={(e) => handleBreedSelect(e.target.value)}
                  style={{ marginTop: '0.25rem' }}
                >
                  {currentBreeds.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__custom__">✨ Other / Custom Breed (Type manually)...</option>
                </select>

                {isCustomBreed && (
                  <input
                    type="text"
                    className="input"
                    style={{ marginTop: '0.4rem' }}
                    placeholder="Type custom breed name..."
                    value={selectedPetBreed}
                    onChange={(e) => setSelectedPetBreed(e.target.value)}
                    autoFocus
                  />
                )}
              </div>

              <div className="form-group">
                <label>Pet Name</label>
                <input
                  type="text"
                  className="input"
                  value={selectedPetName}
                  onChange={(e) => setSelectedPetName(e.target.value)}
                  placeholder="e.g. Rocky, Luna, Milo"
                  required
                />
              </div>
            </>
          )}

          {/* ── Mention Other Pets (External / Neighbors' Animals) ── */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AtSign size={13} style={{ color: 'var(--color-accent-coral)' }} /> Mention Other Pets in Post (Optional)
            </label>
            <input
              type="text"
              className="input"
              value={mentionedPets}
              onChange={(e) => setMentionedPets(e.target.value)}
              placeholder="e.g. @Buddy, @Oscar, neighbor's husky..."
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select className="input" value={newPostCategory} onChange={(e) => setNewPostCategory(e.target.value as any)}>
              <option value="cute">✨ Cute Moment</option>
              <option value="playdate">🐕 Playdate Invite</option>
              <option value="health_tip">🩺 Health & Care Tip</option>
              <option value="lost_found">🚨 Lost & Found SOS (30 Days Active)</option>
              <option value="adoption">🏡 For Adoption</option>
            </select>
          </div>

          {/* ── Media Section: Photo & Video Support ── */}
          <div className="form-group">
            <label>Media (Photo or Video)</label>

            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {image?.previewUrl || newPostImage ? (
              <div style={{ position: 'relative', marginBottom: '0.5rem', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                {isVideoUrl ? (
                  <video
                    src={image?.previewUrl || newPostImage}
                    controls
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', maxHeight: 240, background: '#000', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={image?.previewUrl || newPostImage}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }}
                  />
                )}
                {isUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Loader2 size={32} className="spin" style={{ color: '#38bdf8' }} />
                    <span style={{ color: '#f1f5f9', fontSize: '0.8rem', fontWeight: 600 }}>Uploading media...</span>
                  </div>
                )}
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => { clearImage(); setNewPostImage(''); }}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(0,0,0,0.75)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={openPicker}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px dashed rgba(255,255,255,0.2)',
                    color: 'var(--color-primary, #38bdf8)',
                    borderRadius: 8,
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <ImagePlus size={16} /> 📷 Upload Photo
                </button>
                <button
                  type="button"
                  onClick={openPicker}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'rgba(249,115,22,0.08)',
                    border: '1px dashed rgba(249,115,22,0.3)',
                    color: '#f97316',
                    borderRadius: 8,
                    padding: '0.65rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <Video size={16} /> 🎬 Upload Video
                </button>
              </div>
            )}

            {uploadError && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0 0 0.4rem' }}>{uploadError}</p>}

            {/* Preset sample photos */}
            {!image?.previewUrl && !newPostImage && (
              <>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.4rem' }}>or choose a sample photo:</p>
                <div className="sample-photo-picker">
                  {PRESET_SAMPLE_PHOTOS.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt="Sample"
                      className={`sample-photo-thumb ${newPostImage === photo ? 'sample-photo-thumb--active' : ''}`}
                      onClick={() => setNewPostImage(photo)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              className="input"
              value={newPostLocation}
              onChange={(e) => setNewPostLocation(e.target.value)}
              placeholder="e.g. Carmel Center, Haifa"
            />
          </div>

          <div className="form-group">
            <label>Caption / Message</label>
            <textarea
              className="input"
              rows={3}
              value={newPostCaption}
              onChange={(e) => setNewPostCaption(e.target.value)}
              placeholder="Tell your neighbors what happened, share advice, or ask for playmates..."
              required
            />
          </div>

          {(newPostCategory === 'lost_found' || newPostCategory === 'adoption') && (
            <div className="alert-callout form-group">
              <label>Contact Phone</label>
              <input type="tel" className="input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
              <small>⚠️ {newPostCategory === 'adoption'
                ? 'This phone number will be shown as a 1-click call/WhatsApp for potential adopters.'
                : 'This phone number will be displayed as a 1-click dialer for whoever finds your pet.'}</small>
            </div>
          )}

          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || isUploading}>
              {isUploading ? 'Uploading media...' : isSubmitting ? 'Publishing...' : postMode === 'story' ? 'Share Story' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

