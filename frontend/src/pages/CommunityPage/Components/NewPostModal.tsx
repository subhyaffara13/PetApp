import React from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { useImageUpload } from '../../../Hooks/useImageUpload';

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

  // Sync Cloudinary URL up to parent when upload completes
  React.useEffect(() => {
    if (image?.url) setNewPostImage(image.url);
  }, [image?.url]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>{postMode === 'story' ? '📸 Add 24h Story' : '✍️ Share Community Post'}</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={onSubmit} className="new-post-form">
          <div className="post-mode-toggle">
            <button type="button" className={`mode-btn ${postMode === 'feed' ? 'mode-btn--active' : ''}`} onClick={() => setPostMode('feed')}>
              📰 Feed Post
            </button>
            <button type="button" className={`mode-btn ${postMode === 'story' ? 'mode-btn--active' : ''}`} onClick={() => setPostMode('story')}>
              ⚡ Story (24h Expire)
            </button>
          </div>

          <div className="form-group">
            <label>Pet Name</label>
            <input type="text" className="input" value={selectedPetName} onChange={(e) => setSelectedPetName(e.target.value)} placeholder="e.g. Rocky, Luna, Milo" required />
          </div>

          <div className="form-group">
            <label>Breed / Age / Tag</label>
            <input type="text" className="input" value={selectedPetBreed} onChange={(e) => setSelectedPetBreed(e.target.value)} placeholder="e.g. Golden Retriever · 3 yrs" />
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

          {newPostCategory === 'adoption' && (
            <div className="form-group">
              <label>Breed / Age / Description</label>
              <input type="text" className="input" value={selectedPetBreed} onChange={(e) => setSelectedPetBreed(e.target.value)} placeholder="e.g. Golden Retriever, 3 yrs, good with kids" />
            </div>
          )}

          {/* ── Photo Section ── */}
          <div className="form-group">
            <label>Photo</label>

            {/* Upload your own */}
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

            {image?.previewUrl ? (
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <img src={image.previewUrl} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }} />
                {isUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                    <Loader2 size={28} className="spin" style={{ color: '#fff' }} />
                  </div>
                )}
                {!isUploading && (
                  <button type="button" onClick={clearImage} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ) : (
              <button type="button" onClick={openPicker} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.2)', color: 'var(--color-primary)', borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                <ImagePlus size={16} /> Upload your own photo
              </button>
            )}

            {uploadError && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '0 0 0.4rem' }}>{uploadError}</p>}

            {/* Or pick a sample */}
            {!image?.previewUrl && (
              <>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 0.4rem' }}>or choose a sample:</p>
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
            <input type="text" className="input" value={newPostLocation} onChange={(e) => setNewPostLocation(e.target.value)} placeholder="e.g. Carmel Center, Haifa" />
          </div>

          <div className="form-group">
            <label>Caption / Message</label>
            <textarea className="input" rows={3} value={newPostCaption} onChange={(e) => setNewPostCaption(e.target.value)} placeholder="Tell your neighbors what happened, share advice, or ask for playmates..." required />
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
              {isUploading ? 'Uploading photo...' : isSubmitting ? 'Publishing...' : postMode === 'story' ? 'Share Story' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
