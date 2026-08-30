import React, { useState } from 'react';
import axios from 'axios';
import { Send, Sparkles, CheckCircle2, ShieldCheck, Clock, Stethoscope } from 'lucide-react';
import type { ClaimableClinic } from '../schemas';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ClinicCommunityTabProps {
  clinic: ClaimableClinic;
}

export const ClinicCommunityTab: React.FC<ClinicCommunityTabProps> = ({ clinic }) => {
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<'health_tip' | 'vet_update' | 'playdate'>('health_tip');
  const [mediaUrl, setMediaUrl] = useState('');
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [storyCaption, setStoryCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'post' | 'story') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', target === 'story' ? 'stories' : 'posts');

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (target === 'story') {
        setStoryMediaUrl(res.data.url);
      } else {
        setMediaUrl(res.data.url);
      }
    } catch {
      // Fallback local preview if offline
      const preview = URL.createObjectURL(file);
      if (target === 'story') setStoryMediaUrl(preview);
      else setMediaUrl(preview);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    setIsPosting(true);
    try {
      const payload = {
        authorId: clinic.id,
        authorName: clinic.name,
        authorAvatar: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80',
        authorBadge: 'vet',
        authorRole: 'clinic_admin',
        petId: `clinic-${clinic.id}`,
        petName: 'Verified Clinical Advisory',
        petBreed: 'Veterinary Medicine',
        petAvatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&auto=format&fit=crop&q=80',
        mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80',
        caption: caption.trim(),
        locationTag: clinic.address,
        category,
        contactPhone: clinic.phone || undefined,
      };

      await axios.post(`${API_URL}/community/posts`, payload);
      setCaption('');
      setMediaUrl('');
      setStatusMessage('Official Veterinary Advisory published to Community feed!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to publish clinic post', err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyMediaUrl) return;

    setIsPosting(true);
    try {
      const payload = {
        authorId: clinic.id,
        authorName: clinic.name,
        authorAvatar: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=150&auto=format&fit=crop&q=80',
        authorBadge: 'vet',
        authorRole: 'clinic_admin',
        petName: clinic.name,
        petAvatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&auto=format&fit=crop&q=80',
        mediaUrl: storyMediaUrl,
        caption: storyCaption.trim() || '🏥 Official Clinic 24h Update',
        type: 'vet_tip',
        locationName: clinic.address,
      };

      await axios.post(`${API_URL}/community/stories`, payload);
      setStoryCaption('');
      setStoryMediaUrl('');
      setStatusMessage('24-Hour Verified Clinic Story published!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to publish clinic story', err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(2,132,199,0.15), rgba(15,23,42,0.6))', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <Stethoscope size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>{clinic.name}</h2>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 800 }}>
                <ShieldCheck size={11} /> 🏥 VERIFIED VET
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
              Post official health advisories, emergency alerts & 24h stories directly to local pet owners
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
          <CheckCircle2 size={16} /> {statusMessage}
        </div>
      )}

      {/* Creation Grid: Post + 24h Story */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
        {/* Publish Official Feed Post */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <Sparkles size={18} color="#38bdf8" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>Publish Official Vet Advisory</h3>
          </div>

          <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, padding: '0.5rem', fontSize: '0.82rem' }}
              >
                <option value="health_tip">💡 Veterinary Health & Diet Tip</option>
                <option value="vet_update">🚨 Clinic Announcement / Emergency Intake</option>
                <option value="playdate">🐾 Recovery Story & Success Case</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Advisory Message & Instructions</label>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Extreme heat advisory: ensure your dogs do not walk on hot pavement between 12:00-16:00..."
                required
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, padding: '0.6rem', fontSize: '0.84rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Attach Clinical Photo (Optional)</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'post')} style={{ width: '100%', fontSize: '0.8rem', color: '#94a3b8' }} />
              {mediaUrl && (
                <div style={{ position: 'relative', marginTop: 6, display: 'inline-block' }}>
                  <img src={mediaUrl} alt="preview" style={{ height: 70, borderRadius: 8, objectFit: 'cover' }} />
                  <button type="button" onClick={() => setMediaUrl('')} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer' }}>✕</button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isPosting || isUploading || !caption.trim()}
              style={{ marginTop: 'auto', padding: '0.65rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Send size={14} /> {isPosting ? 'Publishing...' : 'Publish Official Advisory'}
            </button>
          </form>
        </div>

        {/* Publish 24-Hour Clinic Story */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <Clock size={18} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>Publish 24h Clinic Story</h3>
          </div>

          <form onSubmit={handleCreateStory} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Story Photo / Media (Required)</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'story')} style={{ width: '100%', fontSize: '0.8rem', color: '#94a3b8' }} />
              {storyMediaUrl && (
                <div style={{ position: 'relative', marginTop: 6, display: 'inline-block' }}>
                  <img src={storyMediaUrl} alt="story preview" style={{ height: 90, borderRadius: 8, objectFit: 'cover' }} />
                  <button type="button" onClick={() => setStoryMediaUrl('')} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer' }}>✕</button>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Story Caption (Optional)</label>
              <input
                type="text"
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
                placeholder="e.g. 🐶 Max recovered safely after surgery today!"
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, padding: '0.55rem', fontSize: '0.84rem' }}
              />
            </div>

            <p style={{ margin: '0.2rem 0', fontSize: '0.72rem', color: '#64748b' }}>
              ⏱️ Stories appear at the top of the community feed with your 🏥 Verified Vet badge and automatically expire after 24 hours.
            </p>

            <button
              type="submit"
              disabled={isPosting || isUploading || !storyMediaUrl}
              style={{ marginTop: 'auto', padding: '0.65rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Clock size={14} /> {isPosting ? 'Publishing...' : 'Publish 24h Story'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
