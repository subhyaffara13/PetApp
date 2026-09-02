import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import type { CoParentRequest } from '../../schemas';
import { useTranslation } from '../../context/LanguageContext';
import { Users, Check, X, Clock, Shield, Sparkles } from 'lucide-react';
import './CoParentInboxModal.css';

interface CoParentInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: CoParentRequest[];
  onRefresh: () => void;
}

export const CoParentInboxModal: React.FC<CoParentInboxModalProps> = ({
  isOpen,
  onClose,
  requests,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRespond = async (requestId: string, action: 'accept' | 'decline') => {
    setProcessingId(requestId);
    setFeedbackMessage(null);
    try {
      const res = await axios.post(`${API_URL}/pet-profile/co-parent/requests/${requestId}/respond`, {
        action,
      });
      setFeedbackMessage(res.data.message || (action === 'accept' ? 'Invitation accepted!' : 'Invitation declined.'));
      onRefresh();
    } catch (err: any) {
      setFeedbackMessage(err.response?.data?.message || 'Failed to respond to invitation.');
    } finally {
      setProcessingId(null);
    }
  };

  const calculateHoursLeft = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    const hours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    return `${hours}h left`;
  };

  return (
    <div className="coparent-modal-backdrop" onClick={onClose}>
      <div className="coparent-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="coparent-modal-header">
          <div className="coparent-title-group">
            <div className="coparent-header-icon">
              <Users size={22} color="#38bdf8" />
            </div>
            <div>
              <h3 className="coparent-heading">
                {t('coparent.inbox_title', 'Family & Co-Parent Invitations')}
              </h3>
              <p className="coparent-subheading">
                {t('coparent.inbox_sub', 'Share caretaking access and synced medical passports with household members.')}
              </p>
            </div>
          </div>
          <button className="coparent-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {feedbackMessage && (
          <div className="coparent-feedback-banner">
            <Sparkles size={16} />
            <span>{feedbackMessage}</span>
          </div>
        )}

        <div className="coparent-inbox-content">
          {requests.length === 0 ? (
            <div className="coparent-empty-state">
              <div className="coparent-empty-circle">
                <Shield size={28} color="#94a3b8" />
              </div>
              <h4>{t('coparent.no_requests', 'No Pending Invitations')}</h4>
              <p>
                {t(
                  'coparent.no_requests_desc',
                  'When family members or co-parents invite you using your name or email, requests valid for 24 hours will appear here.'
                )}
              </p>
            </div>
          ) : (
            <div className="coparent-request-list">
              {requests.map((req) => (
                <div key={req._id} className="coparent-request-card">
                  <div className="coparent-card-top">
                    <div>
                      <div className="coparent-pet-badge">
                        <span className="coparent-pet-name">🐾 {req.petName}</span>
                        <span className="coparent-passport-tag">#{req.petPassportId}</span>
                      </div>
                      <p className="coparent-inviter-text">
                        Invited by <strong>{req.fromUserName}</strong> ({req.fromUserEmail})
                      </p>
                      <span className="coparent-role-pill">
                        Role: {req.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="coparent-expiry-pill">
                      <Clock size={12} />
                      <span>{calculateHoursLeft(req.expiresAt)}</span>
                    </div>
                  </div>

                  <div className="coparent-card-actions">
                    <button
                      type="button"
                      className="btn-coparent-accept"
                      disabled={processingId === req._id}
                      onClick={() => handleRespond(req._id, 'accept')}
                    >
                      <Check size={14} />
                      {processingId === req._id ? 'Accepting...' : t('coparent.accept', 'Accept & Add to Passport')}
                    </button>
                    <button
                      type="button"
                      className="btn-coparent-decline"
                      disabled={processingId === req._id}
                      onClick={() => handleRespond(req._id, 'decline')}
                    >
                      <X size={14} />
                      {t('coparent.decline', 'Decline')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
