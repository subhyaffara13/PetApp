import React from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export interface ServiceStatus {
  name: string;
  category: 'core' | 'database' | 'portal' | 'integration';
  status: 'healthy' | 'degraded' | 'down';
  uptimePercent: number;
  latencyMs: number;
  lastChecked: string;
}

interface SystemHealthTabProps {
  services: ServiceStatus[];
}

export const SystemHealthTab: React.FC<SystemHealthTabProps> = ({ services }) => {
  return (
    <div className="data-table-card animate-fade-in">
      <div className="table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="var(--admin-primary)" />
          <h3>Real-time Service Health & Uptime Monitor</h3>
        </div>
        <span className="badge-status badge-status--healthy">99.98% System Uptime</span>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Uptime</th>
            <th>Latency</th>
            <th>Last Checked</th>
          </tr>
        </thead>
        <tbody>
          {services.map((srv, idx) => (
            <tr key={idx}>
              <td>
                <strong>{srv.name}</strong>
              </td>
              <td>
                <span style={{ textTransform: 'uppercase', fontSize: '0.68rem', color: 'var(--admin-text-muted)', fontWeight: 700 }}>
                  {srv.category}
                </span>
              </td>
              <td>
                <span className={`badge-status badge-status--${srv.status}`}>
                  {srv.status === 'healthy' && <CheckCircle size={10} style={{ marginRight: 4 }} />}
                  {srv.status === 'degraded' && <AlertTriangle size={10} style={{ marginRight: 4 }} />}
                  {srv.status === 'down' && <XCircle size={10} style={{ marginRight: 4 }} />}
                  {srv.status.toUpperCase()}
                </span>
              </td>
              <td style={{ fontWeight: 700, color: 'var(--admin-success)' }}>{srv.uptimePercent}%</td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{srv.latencyMs} ms</td>
              <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>{srv.lastChecked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
