import React, { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle2, ShieldCheck, Clock, Store, Tag } from 'lucide-react';
import { API_URL } from '../../../config/api';

interface StoreCommunityTabProps {
  store: any;
}

export const StoreCommunityTab: React.FC<StoreCommunityTabProps> = ({ store }) => {
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<'promo' | 'health_tip' | 'playdate'>('promo');
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
        authorId: store._id,
        authorName: store.name,
        authorAvatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80',
        authorBadge: 'merchant',
        authorRole: 'store_merchant',
        petId: `store-${store._id}`,
        petName: 'PetStore Verified Promotion',
        petBreed: 'Pet Nutrition & Supplies',
        petAvatar: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=150&auto=format&fit=crop&q=80',
        mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
        caption: caption.trim(),
        locationTag: store.address || 'Haifa Bay & Carmel',
        category,
        contactPhone: store.phone || undefined,
      };

      await axios.post(`${API_URL}/community/posts`, payload);
      setCaption('');
      setMediaUrl('');
      setStatusMessage('Store promotion & catalog update published to Community feed!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to publish store post', err);
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
        authorId: store._id,
        authorName: store.name,
        authorAvatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80',
        authorBadge: 'merchant',
        authorRole: 'store_merchant',
        petName: store.name,
        petAvatar: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=150&auto=format&fit=crop&q=80',
        mediaUrl: storyMediaUrl,
        caption: storyCaption.trim() || '🏪 New pet treats & food drop!',
        type: 'store_promo',
        locationName: store.name,
      };

      await axios.post(`${API_URL}/community/stories`, payload);
      setStoryCaption('');
      setStoryMediaUrl('');
      setStatusMessage('24-Hour Verified Merchant Story published!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to publish store story', err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(15,23,42,0.6))', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
            <Store size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>{store.name}</h2>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#d97706', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 800 }}>
                <ShieldCheck size={11} /> 🏪 VERIFIED MERCHANT
              </span>
            </div>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
              Publish new pet nutrition arrivals, store discounts & 24h stories directly to local pet parents
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
          <CheckCircle2 size={16} /> {statusMessage}
        </div>
      )}

      {/* Creation Grid: Promo Post + 24h Story */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
        {/* Publish Official Promotion */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <Tag size={18} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>Publish Store Promotion</h3>
          </div>

          <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, padding: '0.5rem', fontSize: '0.82rem' }}
              >
                <option value="promo">🏷️ Special Discount & Bundle Sale</option>
                <option value="health_tip">🥩 New Premium Food / Diet Arrival</option>
                <option value="playdate">🎾 Store Event / Puppy Playdate</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Promotion Details & Offer</label>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. 🐶 Weekend Sale: 20% off all Royal Canin & Orijen premium food! Free delivery on orders over ₪150..."
                required
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, padding: '0.6rem', fontSize: '0.84rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Product / Store Photo</label>
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
              style={{ marginTop: 'auto', padding: '0.65rem', background: '#d97706', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <Send size={14} /> {isPosting ? 'Publishing...' : 'Publish Promotion'}
            </button>
          </form>
        </div>

        {/* Publish 24-Hour Merchant Story */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <Clock size={18} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>Publish 24h Store Story</h3>
          </div>

          <form onSubmit={handleCreateStory} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Story Photo (Required)</label>
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
                placeholder="e.g. 🦴 Fresh shipment of salmon chews just arrived in Haifa!"
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, padding: '0.55rem', fontSize: '0.84rem' }}
              />
            </div>

            <p style={{ margin: '0.2rem 0', fontSize: '0.72rem', color: '#64748b' }}>
              ⏱️ Stories appear at the top of the community feed with your 🏪 Verified Merchant badge and automatically expire after 24 hours.
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
