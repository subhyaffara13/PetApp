import React from 'react';
import { Archive, RotateCcw, Trash2, Calendar, AlertCircle } from 'lucide-react';
import type { PetProfile } from '../../../schemas';

interface ArchivedPetsSectionProps {
  archivedPets: PetProfile[];
  isLoading: boolean;
  onRestorePet: (pet: PetProfile) => void;
  onDeletePet: (id: string) => void;
}

export const ArchivedPetsSection: React.FC<ArchivedPetsSectionProps> = ({
  archivedPets,
  isLoading,
  onRestorePet,
  onDeletePet,
}) => {
  if (isLoading) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
        <p>Loading archived pets from Atlas...</p>
      </div>
    );
  }

  if (archivedPets.length === 0) {
    return (
      <div
        style={{
          padding: '3.5rem 1.5rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          margin: '1rem 0',
        }}
      >
        <Archive size={42} style={{ color: '#64748b', marginBottom: '0.75rem' }} />
        <h3 style={{ color: '#f1f5f9', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
          No Archived Pets
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto' }}>
          When pets are archived (e.g. memorialized, rehomed, or temporarily inactive), they are preserved securely in MongoDB Atlas and listed here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          background: 'rgba(100, 116, 139, 0.12)',
          border: '1px solid rgba(100, 116, 139, 0.25)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          fontSize: '0.82rem',
          color: '#cbd5e1',
        }}
      >
        <AlertCircle size={17} style={{ color: '#94a3b8', flexShrink: 0 }} />
        <span>
          Archived pet records retain complete health histories, vaccine logs, and prescriptions. You can restore them to Active anytime.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {archivedPets.map((pet) => {
          const photo = pet.photoUrl || (pet as any).avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80';
          const archiveDate = pet.archivedAt ? new Date(pet.archivedAt).toLocaleDateString() : 'Archived';
          const reasonText = pet.archivedReason || (pet as any).archiveReason || 'Inactive';

          return (
            <div
              key={pet._id}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <img
                  src={photo}
                  alt={pet.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(60%)' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                  }}
                >
                  🗄️ {reasonText}
                </span>
              </div>

              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>
                    {pet.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {pet.species} · {pet.breed}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', color: '#64748b', fontSize: '0.75rem' }}>
                  <Calendar size={13} />
                  <span>Archived on {archiveDate}</span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => onRestorePet(pet)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      color: '#38bdf8',
                      borderRadius: '10px',
                      padding: '0.5rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <RotateCcw size={14} /> Restore to Active
                  </button>
                  <button
                    type="button"
                    onClick={() => pet._id && onDeletePet(pet._id)}
                    title="Permanently delete pet"
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      borderRadius: '10px',
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
