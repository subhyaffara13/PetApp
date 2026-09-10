import React, { useState } from 'react';
import { X, Brain, ShieldCheck, Plus } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { API_URL } from '../../config/api';
import type { AiPetMemory } from '../../schemas';

interface PetAiMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: AiPetMemory | null;
  onMemoryUpdated: (updated: AiPetMemory) => void;
}

export const PetAiMemoryModal: React.FC<PetAiMemoryModalProps> = ({
  isOpen,
  onClose,
  memory,
  onMemoryUpdated,
}) => {
  const { showToast } = useToast();
  const [newAllergy, setNewAllergy] = useState('');
  const [newDiet, setNewDiet] = useState('');
  const [newPref, setNewPref] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const currentMemory: AiPetMemory = memory || {
    dietaryConstraints: [],
    allergies: [],
    preferences: [],
    healthNotes: [],
  };

  const handleUpdate = async (updates: Partial<AiPetMemory>) => {
    setIsSaving(true);
    try {
      const merged = {
        ...currentMemory,
        ...updates,
      };
      const res = await axios.patch(`${API_URL}/chat/memory`, updates);
      onMemoryUpdated(res.data?.aiMemory || merged);
      showToast('AI Pet Memory updated in MongoDB Atlas', 'success', '🧠 Memory Saved');
    } catch {
      showToast('Failed to save memory to Atlas', 'error', '❌ Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddItem = (field: 'allergies' | 'dietaryConstraints' | 'preferences' | 'healthNotes', val: string, setter: (v: string) => void) => {
    if (!val.trim()) return;
    const existing = currentMemory[field] || [];
    if (existing.includes(val.trim())) return;
    const updated = [...existing, val.trim()];
    setter('');
    handleUpdate({ [field]: updated });
  };

  const handleRemoveItem = (field: 'allergies' | 'dietaryConstraints' | 'preferences' | 'healthNotes', itemToRemove: string) => {
    const updated = (currentMemory[field] || []).filter((item) => item !== itemToRemove);
    handleUpdate({ [field]: updated });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(168, 85, 247, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(168, 85, 247, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c084fc',
              }}
            >
              <Brain size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                Personal Pet AI Memory
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                Atlas RAG context automatically injected into Gemini 2.0 Flash
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.8rem',
              color: '#4ade80',
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>
              Connected to MongoDB Atlas: Your pet’s allergies, health notes, and past chats guide every diagnosis.
            </span>
          </div>

          {/* Allergies */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}>
              🚨 Known Allergies
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {(currentMemory.allergies || []).length === 0 ? (
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>No allergies recorded yet.</span>
              ) : (
                currentMemory.allergies?.map((allergy) => (
                  <span
                    key={allergy}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      borderRadius: '9999px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('allergies', allergy)}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Add allergy (e.g., Chicken, Penicillin)..."
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem('allergies', newAllergy, setNewAllergy)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.4rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleAddItem('allergies', newAllergy, setNewAllergy)}
                disabled={isSaving || !newAllergy.trim()}
                style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 0.8rem' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Dietary Constraints */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}>
              🥣 Dietary Constraints
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {(currentMemory.dietaryConstraints || []).length === 0 ? (
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>No dietary constraints.</span>
              ) : (
                currentMemory.dietaryConstraints?.map((item) => (
                  <span
                    key={item}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      color: '#fbbf24',
                      borderRadius: '9999px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('dietaryConstraints', item)}
                      style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Add dietary constraint (e.g., Grain-free, Low sodium)..."
                value={newDiet}
                onChange={(e) => setNewDiet(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem('dietaryConstraints', newDiet, setNewDiet)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.4rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleAddItem('dietaryConstraints', newDiet, setNewDiet)}
                disabled={isSaving || !newDiet.trim()}
                style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 700, border: 'none', borderRadius: '8px', padding: '0 0.8rem' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}>
              🎾 Preferences & Behavior
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {(currentMemory.preferences || []).length === 0 ? (
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>No preferences recorded.</span>
              ) : (
                currentMemory.preferences?.map((pref) => (
                  <span
                    key={pref}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      color: '#38bdf8',
                      borderRadius: '9999px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {pref}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('preferences', pref)}
                      style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Add preference (e.g., Loves peanut butter, Anxious around thunder)..."
                value={newPref}
                onChange={(e) => setNewPref(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem('preferences', newPref, setNewPref)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.4rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleAddItem('preferences', newPref, setNewPref)}
                disabled={isSaving || !newPref.trim()}
                style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 0.8rem' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Health Notes */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9', display: 'block', marginBottom: '0.4rem' }}>
              📋 Chronic Conditions & Health Notes
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {(currentMemory.healthNotes || []).length === 0 ? (
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>No health notes recorded.</span>
              ) : (
                currentMemory.healthNotes?.map((note) => (
                  <span
                    key={note}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.35)',
                      color: '#c084fc',
                      borderRadius: '9999px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {note}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('healthNotes', note)}
                      style={{ background: 'transparent', border: 'none', color: '#c084fc', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                placeholder="Add condition (e.g., Hip dysplasia, Takes Apoquel daily)..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem('healthNotes', newNote, setNewNote)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '0.4rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              />
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => handleAddItem('healthNotes', newNote, setNewNote)}
                disabled={isSaving || !newNote.trim()}
                style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 0.8rem' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.5)',
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            style={{ borderRadius: '10px', padding: '0.5rem 1.25rem' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
