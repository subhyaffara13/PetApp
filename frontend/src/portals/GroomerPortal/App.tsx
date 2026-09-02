import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import type { GroomingAppointment, GroomingServiceItem } from '../../schemas';
import { ItemizedReceiptModal } from '../../Components/ItemizedReceiptModal/ItemizedReceiptModal';
import { GroomerHeader } from './Components/GroomerHeader';
import { GroomerQueueTab } from './Components/GroomerQueueTab';
import { GroomerServicesTab } from './Components/GroomerServicesTab';
import { GroomerRecordsTab } from './Components/GroomerRecordsTab';
import { GroomerVerificationTab } from './Components/GroomerVerificationTab';
import { NewServiceModal } from './Components/NewServiceModal';
import { CoatNotesModal } from './Components/CoatNotesModal';
import { Calendar, Layers, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import './App.css';

export default function GroomerPortal() {
  const [activeTab, setActiveTab] = useState<'queue' | 'services' | 'records' | 'verification'>('queue');
  const [appointments, setAppointments] = useState<GroomingAppointment[]>([]);
  const [services, setServices] = useState<GroomingServiceItem[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [activeNoteAppt, setActiveNoteAppt] = useState<GroomingAppointment | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const fetchServices = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/grooming/services`);
      if (Array.isArray(res.data)) setServices(res.data);
    } catch {}
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/grooming/appointments`);
      if (Array.isArray(res.data)) setAppointments(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchServices();
    fetchAppointments();
  }, [fetchServices, fetchAppointments]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.patch(`${API_URL}/grooming/appointments/${id}/status`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: newStatus as any } : a))
      );
      showToast(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
    } catch {
      showToast('Failed to update appointment status');
    }
  };

  const handleIssueInvoice = async (id: string) => {
    try {
      const res = await axios.post(`${API_URL}/grooming/appointments/${id}/invoice`);
      setSelectedReceipt(res.data);
      setIsReceiptModalOpen(true);
      fetchAppointments();
      showToast('🧾 Itemized Tax Invoice generated and emailed to customer!');
    } catch {
      showToast('Failed to generate invoice');
    }
  };

  const handleSaveNotes = async (notes: string) => {
    if (!activeNoteAppt) return;
    try {
      await axios.patch(`${API_URL}/grooming/appointments/${activeNoteAppt._id}/status`, {
        status: activeNoteAppt.status,
        coatConditionNotes: notes,
      });
      setAppointments((prev) =>
        prev.map((a) => (a._id === activeNoteAppt._id ? { ...a, coatConditionNotes: notes } : a))
      );
      showToast('Coat & Styling Notes saved!');
      setActiveNoteAppt(null);
    } catch {
      showToast('Failed to save notes');
    }
  };

  const handleCreateService = async (data: any) => {
    try {
      await axios.post(`${API_URL}/grooming/services`, data);
      setIsNewServiceOpen(false);
      fetchServices();
      showToast('New grooming service package added!');
    } catch {
      showToast('Failed to create service');
    }
  };

  const activeCount = appointments.filter((a) => a.status !== 'completed' && a.status !== 'cancelled').length;
  const completedToday = appointments.filter((a) => a.status === 'completed').length;
  const todayRevenue = appointments
    .filter((a) => a.status === 'completed')
    .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

  return (
    <div className="groomer-portal-root">
      {feedbackToast && (
        <div className="groomer-toast-banner">
          <Sparkles size={16} />
          <span>{feedbackToast}</span>
        </div>
      )}

      <GroomerHeader
        activeCount={activeCount}
        completedToday={completedToday}
        todayRevenue={todayRevenue}
        onRefresh={() => { fetchAppointments(); fetchServices(); }}
      />

      <nav className="groomer-nav-tabs">
        <button className={`groomer-tab-btn ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
          <Calendar size={16} /> Grooming Queue ({appointments.length})
        </button>
        <button className={`groomer-tab-btn ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
          <Layers size={16} /> Service Menu ({services.length})
        </button>
        <button className={`groomer-tab-btn ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
          <FileText size={16} /> Coat & Skin Health Logs
        </button>
        <button className={`groomer-tab-btn ${activeTab === 'verification' ? 'active' : ''}`} onClick={() => setActiveTab('verification')}>
          <ShieldCheck size={16} /> License & Badges
        </button>
      </nav>

      <main className="groomer-main-content">
        {activeTab === 'queue' && (
          <GroomerQueueTab
            appointments={appointments}
            onStatusChange={handleStatusChange}
            onEditNotes={(a) => setActiveNoteAppt(a)}
            onIssueInvoice={handleIssueInvoice}
          />
        )}
        {activeTab === 'services' && (
          <GroomerServicesTab services={services} onAddClick={() => setIsNewServiceOpen(true)} />
        )}
        {activeTab === 'records' && (
          <GroomerRecordsTab appointments={appointments} onEditNote={(a) => setActiveNoteAppt(a)} />
        )}
        {activeTab === 'verification' && <GroomerVerificationTab />}
      </main>

      <NewServiceModal isOpen={isNewServiceOpen} onClose={() => setIsNewServiceOpen(false)} onSubmit={handleCreateService} />
      <CoatNotesModal appointment={activeNoteAppt} onClose={() => setActiveNoteAppt(null)} onSave={handleSaveNotes} />
      <ItemizedReceiptModal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} receipt={selectedReceipt} />
    </div>
  );
}
