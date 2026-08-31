import { useState, useEffect } from 'react';
import axios from 'axios';
import { PetList } from '../../Components/PetList/PetList';
import { PetDetailView } from '../../Components/PetDetailView/PetDetailView';
import { PetEditForm } from '../../Components/PetEditForm/PetEditForm';
import { OnboardingFlow } from '../../Components/OnboardingFlow/OnboardingFlow';
import { OwnerProfileModal } from '../../Components/OwnerProfileModal/OwnerProfileModal';
import { ApplyRoleModal } from '../../Components/ApplyRoleModal/ApplyRoleModal';
import { ThemeToggle } from '../../Components/ThemeToggle/ThemeToggle';
import { LanguageSelector } from '../../Components/LanguageSelector/LanguageSelector';
import { ChevronLeft, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import type { PetProfile } from '../../schemas';
import './ProfilePage.css';

import { API_URL } from '../../config/api';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fetchPets = async () => {
    try {
      const res = await axios.get<PetProfile[]>(`${API_URL}/pet-profile`);
      setPets(res.data);
    } catch (err) {
      console.error('Failed to fetch pets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleCreate = async (
    pet: Omit<PetProfile, '_id' | 'createdAt' | 'updatedAt' | 'medicalHistory'>
  ) => {
    try {
      await axios.post(`${API_URL}/pet-profile`, { ...pet, medicalHistory: [], isArchived: false });
      setShowOnboarding(false);
      fetchPets();
    } catch (err) {
      console.error('Failed to create pet:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/pet-profile/${id}`);
      if (selectedPet?._id === id) setSelectedPet(null);
      if (editingPet?._id === id) setEditingPet(null);
      fetchPets();
    } catch (err) {
      console.error('Failed to delete pet:', err);
    }
  };

  const handleToggleArchive = async (pet: PetProfile) => {
    const nextArchived = !pet.isArchived;
    const confirmMessage = nextArchived
      ? t('profile.confirm_archive', 'Archive this pet? The health passport will be safely stored in your Archived tab.')
      : t('profile.confirm_restore', 'Restore this pet to your active dashboard?');

    if (!window.confirm(confirmMessage)) return;

    try {
      await axios.put(`${API_URL}/pet-profile/${pet._id}`, {
        ...pet,
        isArchived: nextArchived,
      });
      if (selectedPet?._id === pet._id) {
        setSelectedPet((prev) => (prev ? { ...prev, isArchived: nextArchived } : null));
      }
      fetchPets();
    } catch (err) {
      console.error('Failed to toggle archive status:', err);
    }
  };

  const handleSaveEdit = async (updated: PetProfile) => {
    try {
      await axios.put(`${API_URL}/pet-profile/${updated._id}`, updated);
      setEditingPet(null);
      fetchPets();
    } catch (err) {
      console.error('Failed to update pet:', err);
    }
  };

  const handleLogout = () => {
    if (window.confirm(t('profile.confirm_logout', 'Are you sure you want to log out?'))) {
      logout();
    }
  };

  // If editing a pet
  if (editingPet) {
    return (
      <div className="profile-page page page-padded" id="pet-edit-page">
        <div className="page-header">
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={() => setEditingPet(null)}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">{t('profile.edit_pet', 'Edit Pet Details')}</h1>
            <p className="page-subtitle">{editingPet.name}</p>
          </div>
        </div>
        <PetEditForm
          pet={editingPet}
          onSave={handleSaveEdit}
          onCancel={() => setEditingPet(null)}
        />
      </div>
    );
  }

  // If viewing pet detail
  if (selectedPet) {
    return (
      <PetDetailView
        pet={selectedPet}
        onBack={() => setSelectedPet(null)}
        onEdit={() => {
          setEditingPet(selectedPet);
          setSelectedPet(null);
        }}
        onDelete={handleDelete}
        onToggleArchive={handleToggleArchive}
      />
    );
  }

  // If adding a new pet via onboarding flow
  if (showOnboarding) {
    return (
      <div className="profile-page page page-padded" id="onboarding-page">
        <OnboardingFlow
          onComplete={handleCreate}
          onCancel={() => setShowOnboarding(false)}
        />
      </div>
    );
  }

  // Pet list view
  return (
    <div className="profile-page page page-padded" id="profile-page">
      <div className="page-header profile-page-header">
        <div>
          <h1 className="page-title">{t('profile.title', 'My Pets')}</h1>
          <p className="page-subtitle">
            {t('profile.managed_by', 'Managed by')} {user?.name || 'Pet Owner'}
          </p>
        </div>

        <div className="profile-header-actions">
          {/* Multi-language Selector */}
          <LanguageSelector variant="pill" />

          {/* Theme Toggle */}
          <ThemeToggle className="theme-toggle-btn-page" />

          {/* Owner Profile Icon Button */}
          <button
            type="button"
            className="owner-profile-icon-btn btn btn-ghost btn-icon"
            onClick={() => setShowOwnerModal(true)}
            title="Edit Owner Profile Info"
            id="owner-profile-icon-btn"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Owner" className="owner-btn-avatar" />
            ) : (
              <UserIcon size={20} />
            )}
          </button>

          {/* Dedicated Logout Button */}
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-logout-action"
            onClick={handleLogout}
            title={t('action.logout', 'Log Out')}
            id="profile-logout-btn"
          >
            <LogOut size={19} color="#ef4444" />
          </button>
        </div>
      </div>

      {/* Professional Role & Verification Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1rem',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, rgba(56,189,248,0.08) 0%, rgba(168,85,247,0.08) 100%)',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ShieldCheck size={22} color="var(--color-primary, #38bdf8)" />
          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
              Are you a Pet Sitter, Shelter, Clinic, or Merchant?
            </strong>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              Get verified, earn community badges, and unlock dedicated portal access.
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowApplyModal(true)}
          style={{ whiteSpace: 'nowrap', fontWeight: 700 }}
        >
          Apply for Role
        </button>
      </div>

      {/* Modular PetList Component with Active vs Archived Segmentation */}
      <PetList
        pets={pets}
        isLoading={isLoading}
        onEdit={(pet) => setEditingPet(pet)}
        onDelete={handleDelete}
        onToggleArchive={handleToggleArchive}
        onSelectPet={(pet) => setSelectedPet(pet)}
        onAddPet={() => setShowOnboarding(true)}
      />

      {/* Owner Profile Modal */}
      <OwnerProfileModal
        isOpen={showOwnerModal}
        onClose={() => setShowOwnerModal(false)}
      />

      {/* Professional Role Application Modal */}
      {showApplyModal && (
        <ApplyRoleModal onClose={() => setShowApplyModal(false)} />
      )}
    </div>
  );
};
