import React, { useState } from 'react';
import axios from 'axios';
import { X, Heart } from 'lucide-react';
import { useToast } from '../../../../context/ToastContext';
import { useImageUpload } from '../../../../Hooks/useImageUpload';
import { API_URL } from '../../../../config/api';

interface AddAdoptablePetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAdoptablePetModal: React.FC<AddAdoptablePetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { image, handleFileChange, clearImage } = useImageUpload('posts');

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat' | 'other'>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [shelterName, setShelterName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [story, setStory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !story.trim()) {
      showToast('Please fill out all required pet details', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/adoption/pets`, {
        name,
        species,
        breed: breed || 'Mixed Breed',
        age: age || 'Young',
        gender,
        shelterName: shelterName || 'Community Rescue',
        contactPhone,
        story,
        avatar: image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400',
      });
      showToast('Adoptable pet listing posted successfully!', 'success');
      clearImage();
      onSuccess();
      onClose();
    } catch {
      showToast('Failed to list pet for adoption.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="donation-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="donation-modal-card card add-pet-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="donation-modal-header">
          <div className="donation-header-title">
            <Heart size={20} color="#ec4899" fill="#ec4899" />
            <h3>List a Pet for Adoption / Rescue</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="add-adoptable-form">
          <div className="form-group">
            <label>Pet Name *</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Species</label>
              <select className="form-input" value={species} onChange={(e) => setSpecies(e.target.value as any)}>
                <option value="dog">🐕 Dog</option>
                <option value="cat">🐈 Cat</option>
                <option value="other">🐾 Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Breed</label>
              <input type="text" className="form-input" placeholder="e.g. Mixed, Labrador" value={breed} onChange={(e) => setBreed(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input type="text" className="form-input" placeholder="e.g. 2 years, 4 months" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value as any)}>
                <option value="male">♂ Male</option>
                <option value="female">♀ Female</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Shelter / Rescue Org Name</label>
              <input type="text" className="form-input" placeholder="e.g. Haifa Animal Rescue" value={shelterName} onChange={(e) => setShelterName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Direct Contact Phone</label>
              <input type="tel" className="form-input" placeholder="e.g. 054-123-4567" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Pet Story & Personality *</label>
            <textarea rows={3} className="form-input" placeholder="Describe their background, temperament, and adoption needs..." value={story} onChange={(e) => setStory(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Pet Photo</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="donation-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Adoption Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
