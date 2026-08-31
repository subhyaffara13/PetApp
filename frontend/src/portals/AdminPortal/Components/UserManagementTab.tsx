import React, { useState } from 'react';
import { Users, UserPlus, ShieldAlert, Archive, CheckCircle } from 'lucide-react';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'clinic_admin' | 'store_merchant';
  status: 'active' | 'blocked' | 'archived';
  createdAt: string;
  lastActive: string;
}

interface UserManagementTabProps {
  users: UserAccount[];
  onUserAction: (id: string, action: 'block' | 'unblock' | 'archive') => void;
  onCreateUser: (name: string, email: string, role: 'customer' | 'clinic_admin' | 'store_merchant') => void;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({
  users,
  onUserAction,
  onCreateUser,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'customer' | 'clinic_admin' | 'store_merchant'>('customer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    onCreateUser(newName, newEmail, newRole);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
  };

  return (
    <div className="data-table-card animate-fade-in">
      <div className="table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} color="var(--admin-primary)" />
          <h3>Atlas Control: User & Merchant Accounts Directory</h3>
        </div>
        <button
          className="btn-admin-action"
          style={{ background: 'var(--admin-primary)', color: '#0f172a', fontWeight: 700 }}
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={13} style={{ marginRight: 4 }} /> Create Account
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name & Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created Date</th>
            <th>Atlas DB Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                {u.id}
              </td>
              <td>
                <strong>{u.name}</strong>
                <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-muted)' }}>{u.email}</div>
              </td>
              <td>
                <span className="badge-status" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--admin-text)' }}>
                  {u.role.replace('_', ' ').toUpperCase()}
                </span>
              </td>
              <td>
                <span className={`badge-status badge-status--${u.status}`}>
                  {u.status.toUpperCase()}
                </span>
              </td>
              <td>{u.createdAt}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {u.status === 'active' ? (
                    <button className="btn-admin-action" onClick={() => onUserAction(u.id, 'block')}>
                      <ShieldAlert size={12} style={{ marginRight: 3 }} /> Block
                    </button>
                  ) : (
                    <button className="btn-admin-action" onClick={() => onUserAction(u.id, 'unblock')}>
                      <CheckCircle size={12} style={{ marginRight: 3 }} /> Unblock
                    </button>
                  )}
                  <button className="btn-admin-action" onClick={() => onUserAction(u.id, 'archive')}>
                    <Archive size={12} style={{ marginRight: 3 }} /> Archive
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-card-border)', padding: '1.5rem', borderRadius: 12, width: 380 }}>
            <h3 style={{ margin: '0 0 1rem' }}>Create Account in Atlas DB</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: 4 }}>Full Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: 6 }}
                  required
                />
              </div>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: 4 }}>Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: 6 }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: 4 }}>Account Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  style={{ width: '100%', padding: '0.5rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: 6 }}
                >
                  <option value="customer">🐾 Pet Parent (Customer)</option>
                  <option value="clinic_admin">🏥 Clinic / Vet Admin (EMR)</option>
                  <option value="store_merchant">🏪 Store Merchant</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-admin-action" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-admin-action" style={{ background: 'var(--admin-primary)', color: '#0f172a', fontWeight: 700 }}>Save to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
