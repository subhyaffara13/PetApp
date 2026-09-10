import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PetList } from '../../Components/PetList/PetList';
import { PetDetailView } from '../../Components/PetDetailView/PetDetailView';
import { PetEditForm } from '../../Components/PetEditForm/PetEditForm';
import { OnboardingFlow } from '../../Components/OnboardingFlow/OnboardingFlow';
import { OwnerProfileModal } from '../../Components/OwnerProfileModal/OwnerProfileModal';
import { ApplyRoleModal } from '../../Components/ApplyRoleModal/ApplyRoleModal';
import { CoParentInboxModal } from '../../Components/CoParentInboxModal/CoParentInboxModal';
import { CoParentInviteModal } from '../../Components/CoParentInviteModal/CoParentInviteModal';
import { ItemizedReceiptModal } from '../../Components/ItemizedReceiptModal/ItemizedReceiptModal';
import { GlobalCalendarModal } from '../../Components/GlobalCalendarModal/GlobalCalendarModal';
import { ProfilePageHeader } from './Components/ProfilePageHeader';
import { CoParentBanner } from './Components/CoParentBanner';
import { SavedReceiptsListModal } from './Components/SavedReceiptsListModal';
import { ArchivedPetsSection } from './Components/ArchivedPetsSection';
import { PastPurchasesSection } from './Components/PastPurchasesSection';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import type { PetProfile, CoParentRequest, Receipt } from '../../schemas';
import { API_URL } from '../../config/api';
import './ProfilePage.css';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [archivedPets, setArchivedPets] = useState<PetProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'pets' | 'purchases' | 'archived'>('pets');
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [coParentRequests, setCoParentRequests] = useState<CoParentRequest[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetProfile | null>(null);
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [invitePet, setInvitePet] = useState<PetProfile | null>(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCoParentInbox, setShowCoParentInbox] = useState(false);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const fetchPets = useCallback(async () => {
    try {
      const res = await axios.get<PetProfile[]>(`${API_URL}/pet-profile`);
      setPets(res.data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchArchivedPets = useCallback(async () => {
    setIsLoadingArchived(true);
    try {
      const res = await axios.get<PetProfile[]>(`${API_URL}/pet-profile/archived`);
      if (Array.isArray(res.data)) setArchivedPets(res.data);
    } catch {
    } finally {
      setIsLoadingArchived(false);
    }
  }, []);

  const fetchCoParentRequests = useCallback(async () => {
    try {
      const res = await axios.get<CoParentRequest[]>(`${API_URL}/pet-profile/co-parent/requests/inbox`);
      if (Array.isArray(res.data)) setCoParentRequests(res.data);
    } catch {}
  }, []);

  const fetchReceipts = useCallback(async () => {
    try {
      const res = await axios.get<Receipt[]>(`${API_URL}/receipts/my-receipts`);
      if (Array.isArray(res.data)) setReceipts(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchPets();
    fetchCoParentRequests();
    fetchReceipts();
  }, [fetchPets, fetchCoParentRequests, fetchReceipts]);

  useEffect(() => {
    if (activeTab === 'archived') {
      fetchArchivedPets();
    }
  }, [activeTab, fetchArchivedPets]);

  const handleCreate = async (pet: Omit<PetProfile, '_id' | 'createdAt' | 'updatedAt' | 'medicalHistory'>) => {
    try {
      await axios.post(`${API_URL}/pet-profile`, { ...pet, medicalHistory: [], isArchived: false });
      setShowOnboarding(false);
      fetchPets();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/pet-profile/${id}`);
      if (selectedPet?._id === id) setSelectedPet(null);
      if (editingPet?._id === id) setEditingPet(null);
      setArchivedPets((prev) => prev.filter((p) => p._id !== id));
      fetchPets();
    } catch {}
  };

  const handleToggleArchive = async (pet: PetProfile) => {
    const nextArchived = !pet.isArchived;
    let reason = 'inactive';
    if (nextArchived) {
      const inputReason = window.prompt(
        `Please specify archive reason for ${pet.name} (e.g. passed, rehomed, inactive, other):`,
        'inactive'
      );
      if (inputReason === null) return;
      reason = inputReason.trim().toLowerCase() || 'inactive';
    } else {
      if (!window.confirm(`Are you sure you want to restore ${pet.name} to active pets?`)) return;
    }

    try {
      await axios.patch(`${API_URL}/pet-profile/${pet._id}/archive`, { isArchived: nextArchived, reason });
      fetchPets();
      if (activeTab === 'archived') fetchArchivedPets();
      if (selectedPet?._id === pet._id) {
        setSelectedPet((prev) => (prev ? { ...prev, isArchived: nextArchived, archivedReason: reason } : null));
      }
    } catch {}
  };

  const handleRestorePet = async (pet: PetProfile) => {
    try {
      await axios.patch(`${API_URL}/pet-profile/${pet._id}/archive`, { isArchived: false });
      setArchivedPets((prev) => prev.filter((p) => p._id !== pet._id));
      fetchPets();
    } catch {}
  };

  const handleUpdate = async (updated: PetProfile) => {
    try {
      await axios.put(`${API_URL}/pet-profile/${updated._id}`, updated);
      setEditingPet(null);
      fetchPets();
      if (selectedPet?._id === updated._id) {
        setSelectedPet(updated);
      }
    } catch {}
  };

  const pendingInvites = coParentRequests.filter((r) => r.status === 'pending');

  return (
    <div className="profile-page page-container">
      <ProfilePageHeader
        selectedPet={selectedPet}
        editingPet={editingPet}
        user={user}
        pendingInvitesCount={pendingInvites.length}
        onBack={() => { setSelectedPet(null); setEditingPet(null); }}
        onOpenOwnerModal={() => setShowOwnerModal(true)}
        onOpenCoParentInbox={() => setShowCoParentInbox(true)}
        onOpenReceiptsModal={() => setShowReceiptsModal(true)}
        onOpenCalendar={() => setShowCalendarModal(true)}
        onLogout={logout}
        t={t}
      />

      <CoParentBanner
        pendingRequests={pendingInvites}
        onClick={() => setShowCoParentInbox(true)}
      />

      {!editingPet && !selectedPet && (
        <div
          className="profile-tabs-nav"
          style={{
            display: 'flex',
            gap: '0.65rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '0.65rem',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            className={`profile-tab-pill ${activeTab === 'pets' ? 'profile-tab-pill--active' : ''}`}
            onClick={() => setActiveTab('pets')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '9999px',
              border: activeTab === 'pets' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              background: activeTab === 'pets' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'pets' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            🐾 Active Pets ({pets.length})
          </button>
          <button
            type="button"
            className={`profile-tab-pill ${activeTab === 'purchases' ? 'profile-tab-pill--active' : ''}`}
            onClick={() => setActiveTab('purchases')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '9999px',
              border: activeTab === 'purchases' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              background: activeTab === 'purchases' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'purchases' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            📦 Past Purchases
          </button>
          <button
            type="button"
            className={`profile-tab-pill ${activeTab === 'archived' ? 'profile-tab-pill--active' : ''}`}
            onClick={() => setActiveTab('archived')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1.1rem',
              borderRadius: '9999px',
              border: activeTab === 'archived' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              background: activeTab === 'archived' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: activeTab === 'archived' ? '#38bdf8' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            🗄️ Archived Pets
          </button>
        </div>
      )}

      {editingPet ? (
        <PetEditForm pet={editingPet} onSave={handleUpdate} onCancel={() => setEditingPet(null)} />
      ) : selectedPet ? (
        <PetDetailView
          pet={selectedPet}
          onBack={() => setSelectedPet(null)}
          onEdit={(p) => setEditingPet(p)}
          onDelete={handleDelete}
          onToggleArchive={handleToggleArchive}
          onRefresh={fetchPets}
        />
      ) : activeTab === 'purchases' ? (
        <PastPurchasesSection userId={user?.id} />
      ) : activeTab === 'archived' ? (
        <ArchivedPetsSection
          archivedPets={archivedPets}
          isLoading={isLoadingArchived}
          onRestorePet={handleRestorePet}
          onDeletePet={handleDelete}
        />
      ) : (
        <PetList
          pets={pets}
          isLoading={isLoading}
          onEdit={(p) => setEditingPet(p)}
          onDelete={handleDelete}
          onToggleArchive={handleToggleArchive}
          onInviteCoParent={(p) => setInvitePet(p)}
          onSelectPet={(p) => setSelectedPet(p)}
          onAddPet={() => setShowOnboarding(true)}
        />
      )}

      {showOnboarding && <OnboardingFlow onComplete={handleCreate} onCancel={() => setShowOnboarding(false)} />}
      <OwnerProfileModal isOpen={showOwnerModal} onClose={() => setShowOwnerModal(false)} />
      {showApplyModal && <ApplyRoleModal onClose={() => setShowApplyModal(false)} />}
      <CoParentInboxModal
        isOpen={showCoParentInbox}
        onClose={() => setShowCoParentInbox(false)}
        requests={coParentRequests}
        onRefresh={() => { fetchCoParentRequests(); fetchPets(); }}
      />
      {invitePet && (
        <CoParentInviteModal
          isOpen={!!invitePet}
          onClose={() => setInvitePet(null)}
          pet={invitePet}
          onSuccess={() => { fetchPets(); setInvitePet(null); }}
        />
      )}
      <SavedReceiptsListModal
        isOpen={showReceiptsModal}
        onClose={() => setShowReceiptsModal(false)}
        receipts={receipts}
        onSelectReceipt={(r) => { setSelectedReceipt(r); setShowReceiptsModal(false); }}
      />
      <ItemizedReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
      <GlobalCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />
    </div>
  );
};
