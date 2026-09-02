import React from 'react';
import { User as UserIcon, LogOut, Users, Receipt as ReceiptIcon, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { ThemeToggle } from '../../../Components/ThemeToggle/ThemeToggle';
import { LanguageSelector } from '../../../Components/LanguageSelector/LanguageSelector';

interface ProfilePageHeaderProps {
  selectedPet: any;
  editingPet: any;
  user: any;
  pendingInvitesCount: number;
  onBack: () => void;
  onOpenOwnerModal: () => void;
  onOpenCoParentInbox: () => void;
  onOpenReceiptsModal: () => void;
  onOpenCalendar?: () => void;
  onLogout: () => void;
  t: (key: string, fallback?: string) => string;
}

export const ProfilePageHeader: React.FC<ProfilePageHeaderProps> = ({
  selectedPet,
  editingPet,
  user,
  pendingInvitesCount,
  onBack,
  onOpenOwnerModal,
  onOpenCoParentInbox,
  onOpenReceiptsModal,
  onOpenCalendar,
  onLogout,
  t,
}) => {
  return (
    <div className="profile-page-header">
      {selectedPet || editingPet ? (
        <button
          className="btn btn-ghost btn-sm"
          onClick={onBack}
        >
          <ChevronLeft size={16} /> {t('action.back', 'Back')}
        </button>
      ) : (
        <div>
          <h2 className="heading-lg">{t('profile.title', 'My Pets')}</h2>
          <p className="page-subtitle">
            {t('profile.managed_by', 'Managed by')} {user?.name || user?.email || 'Guest User'}
          </p>
        </div>
      )}

      <div className="profile-header-actions">
        <ThemeToggle />
        <LanguageSelector />

        {onOpenCalendar && (
          <button
            className="calendar-trigger-btn"
            onClick={onOpenCalendar}
            title="All Pets Care Calendar & Tasks"
          >
            <CalendarIcon size={18} />
          </button>
        )}

        {user && (
          <>
            <button
              className="coparent-inbox-trigger-btn"
              onClick={onOpenCoParentInbox}
              title="Co-Parenting & Household Requests"
            >
              <Users size={18} color="#38bdf8" />
              {pendingInvitesCount > 0 && (
                <span className="coparent-badge-count">{pendingInvitesCount}</span>
              )}
            </button>

            <button
              className="receipts-trigger-btn"
              onClick={onOpenReceiptsModal}
              title="My Saved Receipts & Tax Invoices"
            >
              <ReceiptIcon size={18} color="#34d399" />
            </button>
          </>
        )}

        <button
          className="owner-profile-icon-btn"
          onClick={onOpenOwnerModal}
          title="Parent Profile & Settings"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="owner-btn-avatar" />
          ) : (
            <UserIcon size={18} />
          )}
        </button>

        {user && (
          <button
            className="btn-logout-action"
            onClick={onLogout}
            title={t('action.logout', 'Log Out')}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
