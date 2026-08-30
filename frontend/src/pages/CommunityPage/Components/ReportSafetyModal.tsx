import React, { useState } from 'react';
import axios from 'axios';
import { X, ShieldAlert, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import type { UserProfileData } from './SocialProfileBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ReportSafetyModalProps {
  reportedUser: UserProfileData;
  chatTranscriptSnippet?: string;
  onClose: () => void;
}

export const ReportSafetyModal: React.FC<ReportSafetyModalProps> = ({
  reportedUser,
  chatTranscriptSnippet,
  onClose,
}) => {
  const { user: authUser } = useAuth();
  const { showToast } = useToast();
  const [reason, setReason] = useState<'harassment' | 'spam' | 'scam' | 'inappropriate_content' | 'other'>('harassment');
  const [details, setDetails] = useState('');
  const [attachChat, setAttachChat] = useState(!!chatTranscriptSnippet);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/community/report`, {
        reporterId: authUser?.id || 'current-user',
        reporterName: authUser?.name || 'Anonymous Reporter',
        reportedUserId: reportedUser.id,
        reportedUserName: reportedUser.name,
        reason,
        details,
        chatTranscriptSnippet: attachChat ? chatTranscriptSnippet : '',
      });

      setSubmitted(true);
      showToast('Report submitted to safety moderation team', 'info', '🛡️ Safety Report');
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch {
      showToast('Failed to submit report. Please try again.', 'error', '❌ Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="auth-modal card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, padding: '1.75rem', width: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} color="#ef4444" />
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem', fontWeight: 800 }}>Report User or Chat</h3>
          </div>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ color: '#f8fafc', margin: '0 0 0.5rem' }}>Report Received</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Our safety and moderation team has received your report against <strong>{reportedUser.name}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.82rem' }}>
              Reporting <strong>{reportedUser.name}</strong> ({reportedUser.handle}). All reports are reviewed by PetSOS admins within 24 hours.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                Reason for Report
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  padding: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="harassment" style={{ background: '#0f172a' }}>Harassment / Threatening Behavior</option>
                <option value="spam" style={{ background: '#0f172a' }}>Spam or Bot Activity</option>
                <option value="scam" style={{ background: '#0f172a' }}>Scam or Fraudulent Pet Listing</option>
                <option value="inappropriate_content" style={{ background: '#0f172a' }}>Inappropriate or Graphic Content</option>
                <option value="other" style={{ background: '#0f172a' }}>Other Violation</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain what happened..."
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  padding: '0.5rem',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            {chatTranscriptSnippet && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.6rem', borderRadius: 8 }}>
                <input
                  type="checkbox"
                  checked={attachChat}
                  onChange={(e) => setAttachChat(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  <strong>Attach recent chat transcript:</strong> Securely share the message log with moderators to verify harassment or scams.
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <Send size={16} /> {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
