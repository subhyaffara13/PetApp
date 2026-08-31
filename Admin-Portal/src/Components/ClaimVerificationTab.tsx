import React from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';

export interface ClaimRequest {
  id: string;
  userId?: string;
  entityType: 'clinic' | 'store' | 'shelter' | 'sitter';
  practiceType?: 'stationary_clinic' | 'mobile_vet' | 'none';
  entityName: string;
  entityAddress: string;
  contactName: string;
  contactPhone: string;
  businessLicense: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

interface ClaimVerificationTabProps {
  claims: ClaimRequest[];
  onVerify: (id: string, status: 'approved' | 'rejected') => void;
}

const TYPE_CONFIG = {
  clinic: { label: '🏥 VET CLINIC', bg: 'rgba(56,189,248,0.12)', color: '#38bdf8' },
  store: { label: '🏪 PET STORE', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  shelter: { label: '🏠 RESCUE SHELTER', bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  sitter: { label: '🐕 PET SITTER', bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },
};

export const ClaimVerificationTab: React.FC<ClaimVerificationTabProps> = ({ claims, onVerify }) => {
  return (
    <div className="data-table-card animate-fade-in">
      <div className="table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--admin-primary)" />
          <h3>Professional Verification & Portal Claims</h3>
        </div>
        <span className="badge-status badge-status--pending">
          {claims.filter((c) => c.status === 'pending').length} Pending Reviews
        </span>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Claim ID</th>
            <th>Type</th>
            <th>Applicant / Organization</th>
            <th>Contact & License</th>
            <th>Submitted At</th>
            <th>Status</th>
            <th>Verification Action</th>
          </tr>
        </thead>
        <tbody>
          {claims.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--admin-text-muted)' }}>
                No claim submissions currently pending review.
              </td>
            </tr>
          ) : (
            claims.map((claim) => {
              const cfg = TYPE_CONFIG[claim.entityType] || TYPE_CONFIG.clinic;
              return (
                <tr key={claim.id}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem' }}>{claim.id}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                      <span className="badge-status" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      {claim.entityType === 'clinic' && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: claim.practiceType === 'mobile_vet' ? 'rgba(236,72,153,0.15)' : 'rgba(56,189,248,0.15)',
                            color: claim.practiceType === 'mobile_vet' ? '#f472b6' : '#38bdf8',
                            border: claim.practiceType === 'mobile_vet' ? '1px solid rgba(236,72,153,0.3)' : '1px solid rgba(56,189,248,0.3)',
                          }}
                        >
                          {claim.practiceType === 'mobile_vet' ? '🚐 ON-THE-MOVE VET' : '🏥 LOCAL CLINIC'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <strong>{claim.entityName}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{claim.entityAddress}</div>
                  </td>
                  <td>
                    <div>{claim.contactName} ({claim.contactPhone})</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                      Ref: {claim.businessLicense}
                    </div>
                  </td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>{claim.submittedAt}</td>
                  <td>
                    <span className={`badge-status badge-status--${claim.status}`}>
                      {claim.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {claim.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          className="btn-admin-action"
                          style={{ background: 'var(--admin-success)', color: '#0f172a', fontWeight: 700 }}
                          onClick={() => onVerify(claim.id, 'approved')}
                        >
                          <Check size={12} style={{ marginRight: 3 }} /> Approve
                        </button>
                        <button
                          className="btn-admin-action"
                          style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}
                          onClick={() => onVerify(claim.id, 'rejected')}
                        >
                          <X size={12} style={{ marginRight: 3 }} /> Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Verified</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
