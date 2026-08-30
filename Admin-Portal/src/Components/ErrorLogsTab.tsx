import React, { useState } from 'react';
import { AlertCircle, Bug, Send } from 'lucide-react';

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
  timestamp: string;
  userReported?: boolean;
}

interface ErrorLogsTabProps {
  logs: SystemLog[];
  onReportIncident: (service: string, message: string) => void;
}

export const ErrorLogsTab: React.FC<ErrorLogsTabProps> = ({ logs, onReportIncident }) => {
  const [serviceInput, setServiceInput] = useState('Customer App UI');
  const [messageInput, setMessageInput] = useState('');

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onReportIncident(serviceInput, messageInput.trim());
    setMessageInput('');
  };

  return (
    <div className="data-table-card animate-fade-in">
      <div className="table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bug size={18} color="var(--admin-danger)" />
          <h3>System Error Feed & User Reported Incidents</h3>
        </div>
        <span className="badge-status badge-status--error">
          {logs.filter((l) => l.level === 'error').length} Errors Logged
        </span>
      </div>

      {/* Report Incident Form */}
      <form onSubmit={handleReport} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem 1.25rem', borderBottom: '1px solid var(--admin-card-border)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-primary)', whiteSpace: 'nowrap' }}>
          🚨 Relay User Error:
        </span>
        <select
          value={serviceInput}
          onChange={(e) => setServiceInput(e.target.value)}
          style={{ padding: '0.4rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: 6, fontSize: '0.8rem' }}
        >
          <option value="Customer App UI">Customer App UI</option>
          <option value="Clinic Station Portal">Clinic Station Portal</option>
          <option value="Store Merchant Portal">Store Merchant Portal</option>
          <option value="NestJS API Service">NestJS API Service</option>
          <option value="Payment / Stripe">Payment / Stripe</option>
          <option value="Wolt Delivery DaaS">Wolt Delivery DaaS</option>
        </select>

        <input
          type="text"
          placeholder="Describe error message or stack trace reported by user..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          style={{ flex: 1, padding: '0.4rem 0.75rem', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: 6, fontSize: '0.8rem' }}
          required
        />

        <button type="submit" className="btn-admin-action" style={{ background: 'var(--admin-danger)', color: '#fff', fontWeight: 700 }}>
          <Send size={12} style={{ marginRight: 4 }} /> Relay Incident
        </button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Log ID</th>
            <th>Level</th>
            <th>Service / Component</th>
            <th>Error Message / Incident Details</th>
            <th>Source</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                {log.id}
              </td>
              <td>
                <span className={`badge-status badge-status--${log.level}`}>
                  {log.level.toUpperCase()}
                </span>
              </td>
              <td>
                <strong>{log.service}</strong>
              </td>
              <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: log.level === 'error' ? '#ef4444' : 'var(--admin-text)' }}>
                {log.message}
              </td>
              <td>
                {log.userReported ? (
                  <span className="badge-status badge-status--warn">
                    <AlertCircle size={10} style={{ marginRight: 3 }} /> USER REPORTED
                  </span>
                ) : (
                  <span className="badge-status badge-status--healthy">SYSTEM TELEMETRY</span>
                )}
              </td>
              <td style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>{log.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
