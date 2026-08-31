import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, FileText, Printer, TrendingUp, CheckCircle } from 'lucide-react';
import { ReportPrintModal } from './ReportPrintModal';
import './FinancialReportsTab.css';

interface FinancialReportsTabProps {
  storeId: string;
  storeName: string;
  apiUrl: string;
}

export const FinancialReportsTab: React.FC<FinancialReportsTabProps> = ({ storeId, storeName, apiUrl }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [activeReportModal, setActiveReportModal] = useState<'X_REPORT' | 'Z_REPORT' | null>(null);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${apiUrl}/store-portal/${storeId}/reports`);
      setReports(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchReports();
  }, [storeId]);

  const totalGross = reports.reduce((sum, r) => sum + (r.subOrder?.subtotalAmount || 0), 0);
  const totalDelivered = reports.filter((r) => r.subOrder?.status === 'delivered').length;

  return (
    <div className="financial-reports-container">
      <div className="reports-header-row">
        <div>
          <h2>📈 Financial Reports & Historical Archive</h2>
          <p>Accounting records, tax breakdowns, and daily shift summaries for <strong>{storeName}</strong></p>
        </div>
        <div className="reports-btn-group">
          <button type="button" className="btn-x-report" onClick={() => setActiveReportModal('X_REPORT')}>
            <Printer size={14} /> 🖨️ Daily X-Report
          </button>
          <button type="button" className="btn-z-report" onClick={() => setActiveReportModal('Z_REPORT')}>
            <FileText size={14} /> 📄 Monthly Z-Report
          </button>
        </div>
      </div>

      <div className="financial-metrics-grid">
        <div className="fin-metric-card">
          <DollarSign size={20} color="#10b981" />
          <div>
            <small>Gross Merchandise Sales</small>
            <strong>₪{totalGross.toFixed(2)}</strong>
          </div>
        </div>
        <div className="fin-metric-card">
          <CheckCircle size={20} color="#3b82f6" />
          <div>
            <small>Completed Deliveries</small>
            <strong>{totalDelivered} Orders</strong>
          </div>
        </div>
        <div className="fin-metric-card">
          <TrendingUp size={20} color="#f59e0b" />
          <div>
            <small>Total Processed</small>
            <strong>{reports.length} Transactions</strong>
          </div>
        </div>
      </div>

      <div className="archive-table-box">
        <h3>Historical Order Archive</h3>
        <table className="financial-archive-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID</th>
              <th>Destination</th>
              <th>Items</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No historical orders recorded yet.</td></tr>
            ) : (
              reports.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Today'}</td>
                  <td><strong>#{r.subOrder?._id?.slice(-5)?.toUpperCase() || 'ORD'}</strong></td>
                  <td>{r.deliveryAddress?.street}, {r.deliveryAddress?.city}</td>
                  <td>{r.subOrder?.items?.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}</td>
                  <td><span className={`status-pill pill-${r.subOrder?.status}`}>{r.subOrder?.status}</span></td>
                  <td><strong>₪{(r.subOrder?.subtotalAmount + (r.subOrder?.deliveryFee || 0)).toFixed(2)}</strong></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {activeReportModal && (
        <ReportPrintModal
          type={activeReportModal}
          storeName={storeName}
          orders={reports}
          onClose={() => setActiveReportModal(null)}
        />
      )}
    </div>
  );
};
