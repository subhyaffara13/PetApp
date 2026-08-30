import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Users, ShieldCheck, Bug, RefreshCw, Server, ShieldAlert } from 'lucide-react';
import { PinGate } from './Components/PinGate';
import { SystemHealthTab, type ServiceStatus } from './Components/SystemHealthTab';
import { UserManagementTab, type UserAccount } from './Components/UserManagementTab';
import { ClaimVerificationTab, type ClaimRequest } from './Components/ClaimVerificationTab';
import { ErrorLogsTab, type SystemLog } from './Components/ErrorLogsTab';
import { CommunityReportsTab, type CommunityReportItem } from './Components/CommunityReportsTab';

axios.interceptors.request.use((config) => {
  config.headers['x-admin-token'] = import.meta.env.VITE_ADMIN_TOKEN || 'petsos-admin-change-me';
  return config;
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function App() {
  const [activeTab, setActiveTab] = useState<'health' | 'users' | 'claims' | 'reports' | 'logs'>('health');
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [reports, setReports] = useState<CommunityReportItem[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [healthRes, usersRes, claimsRes, reportsRes, logsRes] = await Promise.all([
        axios.get<ServiceStatus[]>(`${API_URL}/admin/health`).catch(() => ({ data: [] })),
        axios.get<UserAccount[]>(`${API_URL}/admin/users`).catch(() => ({ data: [] })),
        axios.get<ClaimRequest[]>(`${API_URL}/admin/claims`).catch(() => ({ data: [] })),
        axios.get<CommunityReportItem[]>(`${API_URL}/admin/reports`).catch(() => ({ data: [] })),
        axios.get<SystemLog[]>(`${API_URL}/admin/logs`).catch(() => ({ data: [] })),
      ]);

      if (healthRes.data) setServices(healthRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (claimsRes.data) setClaims(claimsRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
      if (logsRes.data) setLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUserAction = async (id: string, action: 'block' | 'unblock' | 'archive') => {
    try {
      const res = await axios.post<UserAccount>(`${API_URL}/admin/users/${id}/action`, { action });
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    } catch (err) {
      console.error('User action error', err);
    }
  };

  const handleCreateUser = async (name: string, email: string, role: 'customer' | 'clinic_admin' | 'store_merchant') => {
    try {
      const res = await axios.post<UserAccount>(`${API_URL}/admin/users`, { name, email, role });
      setUsers((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error('Create user error', err);
    }
  };

  const handleVerifyClaim = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await axios.post<ClaimRequest>(`${API_URL}/admin/claims/${id}/verify`, { status });
      setClaims((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } catch (err) {
      console.error('Verify claim error', err);
    }
  };

  const handleReportAction = async (id: string, action: 'dismiss' | 'action_taken' | 'block_user') => {
    try {
      const res = await axios.post(`${API_URL}/admin/reports/${id}/action`, { action });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: res.data.status } : r))
      );
      if (action === 'block_user') {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Report action error', err);
    }
  };

  const handleReportIncident = async (service: string, message: string) => {
    try {
      const res = await axios.post<SystemLog>(`${API_URL}/admin/logs/report`, { service, message });
      setLogs((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error('Report log error', err);
    }
  };

  const pendingReportsCount = reports.filter((r) => r.status === 'pending').length;
  const pendingClaimsCount = claims.filter((c) => c.status === 'pending').length;

  const dashboard = (
    <div className="admin-layout">
      {/* Super Admin Top Bar */}
      <nav className="admin-navbar">
        <div className="admin-brand">
          <Server size={22} color="var(--admin-primary)" />
          <h2>PetSOS Super Admin Control Station</h2>
          <span>SUPERUSER ATLAS ACCESS</span>
        </div>

        <div className="admin-nav-tabs">
          <button className={`nav-tab-btn ${activeTab === 'health' ? 'nav-tab-btn--active' : ''}`} onClick={() => setActiveTab('health')}>
            <Activity size={14} /> System Uptime &amp; Health
          </button>
          <button className={`nav-tab-btn ${activeTab === 'users' ? 'nav-tab-btn--active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={14} /> Atlas DB Users ({users.length})
          </button>
          <button className={`nav-tab-btn ${activeTab === 'claims' ? 'nav-tab-btn--active' : ''}`} onClick={() => setActiveTab('claims')}>
            <ShieldCheck size={14} /> Claims ({pendingClaimsCount})
          </button>
          <button className={`nav-tab-btn ${activeTab === 'reports' ? 'nav-tab-btn--active' : ''}`} onClick={() => setActiveTab('reports')}>
            <ShieldAlert size={14} color="#ef4444" /> Community Reports ({pendingReportsCount})
          </button>
          <button className={`nav-tab-btn ${activeTab === 'logs' ? 'nav-tab-btn--active' : ''}`} onClick={() => setActiveTab('logs')}>
            <Bug size={14} /> Incidents &amp; Error Feed
          </button>
          <button className="nav-tab-btn" style={{ background: 'rgba(255,255,255,0.06)', marginLeft: '0.5rem' }} onClick={fetchAdminData} title="Refresh Telemetry">
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </nav>

      <main className="admin-container">
        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-card__title">Total Services</div>
            <div className="metric-card__value" style={{ color: 'var(--admin-primary)' }}>8 / 8 Online</div>
          </div>
          <div className="metric-card">
            <div className="metric-card__title">Registered Users</div>
            <div className="metric-card__value">{users.length} Active</div>
          </div>
          <div className="metric-card">
            <div className="metric-card__title">Pending Safety Reports</div>
            <div className="metric-card__value" style={{ color: pendingReportsCount > 0 ? '#ef4444' : '#10b981' }}>
              {pendingReportsCount} Reports
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card__title">Pending Portal Claims</div>
            <div className="metric-card__value" style={{ color: 'var(--admin-warning)' }}>{pendingClaimsCount} Action Required</div>
          </div>
        </section>

        {activeTab === 'health' && <SystemHealthTab services={services} />}
        {activeTab === 'users' && <UserManagementTab users={users} onUserAction={handleUserAction} onCreateUser={handleCreateUser} />}
        {activeTab === 'claims' && <ClaimVerificationTab claims={claims} onVerify={handleVerifyClaim} />}
        {activeTab === 'reports' && <CommunityReportsTab reports={reports} onAction={handleReportAction} apiUrl={API_URL} />}
        {activeTab === 'logs' && <ErrorLogsTab logs={logs} onReportIncident={handleReportIncident} />}
      </main>
    </div>
  );

  return <PinGate>{dashboard}</PinGate>;
}
