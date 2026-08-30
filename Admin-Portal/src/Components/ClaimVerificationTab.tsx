import React from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';

export interface ClaimRequest {
  id: string;
  entityType: 'clinic' | 'store';
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

export const ClaimVerificationTab: React.FC<ClaimVerificationTabProps> = ({ claims, onVerify }) => {
  return (
    <div className="data-table-card animate-fade-in">
      <div className="table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--admin-primary)" />
          <h3>Clinic & Store Portal Claim Submissions</h3>
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
            <th>Clinic / Store Name</th>
            <th>Contact & License</th>
            <th>Submitted At</th>
            <th>Status</th>
            <th>Verification Action</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr key={claim.id}>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem' }}>{claim.id}</td>
              <td>
                <span className="badge-status" style={{ background: claim.entityType === 'clinic' ? 'rgba(56,189,248,0.12)' : 'rgba(245,158,11,0.12)', color: claim.entityType === 'clinic' ? '#38bdf8' : '#f59e0b' }}>
                  {claim.entityType.toUpperCase()}
                </span>
              </td>
              <td>
                <strong>{claim.entityName}</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{claim.entityAddress}</div>
              </td>
              <td>
                <div>{claim.contactName} ({claim.contactPhone})</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--admin-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                  License: {claim.businessLicense}
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
          ))}
        </tbody>
      </table>
    </div>
  );
};
