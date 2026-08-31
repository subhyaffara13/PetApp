import React, { useState } from 'react';
import { ShieldAlert, UserX, CheckCircle, Clock, MessageSquare } from 'lucide-react';

export interface CommunityReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reason: string;
  details: string;
  chatTranscriptSnippet: string;
  status: 'pending' | 'reviewed' | 'action_taken' | 'dismissed';
  createdAt: string;
}

interface CommunityReportsTabProps {
  reports: CommunityReportItem[];
  onAction: (id: string, action: 'dismiss' | 'action_taken' | 'block_user') => Promise<void>;
  apiUrl: string;
}

export const CommunityReportsTab: React.FC<CommunityReportsTabProps> = ({ reports, onAction }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'action_taken' | 'dismissed'>('all');

  const filtered = reports.filter((r) => filter === 'all' || r.status === filter);
  const pendingCount = reports.filter((r) => r.status === 'pending').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={22} color="#ef4444" /> Community Safety & Harassment Reports
          </h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Review user reports, inspect attached encrypted chat transcripts, and enforce platform safety rules
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {(['all', 'pending', 'action_taken', 'dismissed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: filter === f ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                background: filter === f ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.03)',
                color: filter === f ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
              }}
            >
              {f === 'all' && `All (${reports.length})`}
              {f === 'pending' && `Pending (${pendingCount})`}
              {f === 'action_taken' && 'Action Taken'}
              {f === 'dismissed' && 'Dismissed'}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)', color: '#94a3b8' }}>
          <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 0.5rem', opacity: 0.8 }} />
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>No safety reports found</p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem' }}>Community conversations and interactions are healthy.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filtered.map((report) => (
            <div
              key={report.id}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${report.status === 'pending' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12,
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span
                      style={{
                        background: 'rgba(239,68,68,0.15)',
                        color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 6,
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      {report.reason.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> {report.createdAt}
                    </span>
                  </div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>
                    Reported User: <span style={{ color: '#f59e0b' }}>{report.reportedUserName || report.reportedUserId}</span>
                  </strong>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem', marginLeft: '0.5rem' }}>
                    (Filed by: {report.reporterName || report.reporterId})
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 12,
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background:
                      report.status === 'pending'
                        ? 'rgba(239,68,68,0.15)'
                        : report.status === 'action_taken'
                        ? 'rgba(16,185,129,0.15)'
                        : 'rgba(255,255,255,0.06)',
                    color:
                      report.status === 'pending'
                        ? '#ef4444'
                        : report.status === 'action_taken'
                        ? '#10b981'
                        : '#94a3b8',
                  }}
                >
                  {report.status.toUpperCase()}
                </span>
              </div>

              {/* Report Description */}
              {report.details && (
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: 8, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  <strong>Reporter Notes:</strong> {report.details}
                </div>
              )}

              {/* Attached Decrypted Chat Transcript */}
              {report.chatTranscriptSnippet && (
                <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.4rem' }}>
                    <MessageSquare size={13} /> Attached Decrypted Chat Transcript:
                  </div>
                  <pre style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: 120, overflowY: 'auto' }}>
                    {report.chatTranscriptSnippet}
                  </pre>
                </div>
              )}

              {/* Admin Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => onAction(report.id, 'block_user')}
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.4)',
                    color: '#ef4444',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <UserX size={13} /> Block Reported User
                </button>

                <button
                  type="button"
                  onClick={() => onAction(report.id, 'action_taken')}
                  style={{
                    background: 'rgba(16,185,129,0.15)',
                    border: '1px solid rgba(16,185,129,0.4)',
                    color: '#10b981',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle size={13} /> Mark Action Taken
                </button>

                <button
                  type="button"
                  onClick={() => onAction(report.id, 'dismiss')}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#94a3b8',
                    borderRadius: 6,
                    padding: '5px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
