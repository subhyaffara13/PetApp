import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import './ContactSupportModal.css';

interface ContactSupportModalProps {
  onClose: () => void;
  defaultCategory?: string;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({ onClose, defaultCategory = 'bug' }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<string>(defaultCategory);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await axios.post(`${API_URL}/support/contact`, {
        name,
        email,
        category,
        message,
      });
      setSubmittedTicket(res.data.ticketId);
    } catch {
      setSubmitError('Failed to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="support-modal-overlay" onClick={onClose}>
      <div className="support-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="support-modal-header">
          <h3>💬 PetSOS Support & Error Report</h3>
          <button className="btn-close-support" onClick={onClose}>✕</button>
        </div>

        {submittedTicket ? (
          <div className="support-success-box">
            <span className="success-icon">✅</span>
            <h4>Support Request Received</h4>
            <p>Your ticket reference: <strong>#{submittedTicket}</strong></p>
            <p>Our triage engineering & clinic operations team will review this promptly.</p>
            <button className="btn-support-done" onClick={onClose}>Close</button>
          </div>
        ) : (
          <form className="support-form" onSubmit={handleSubmit}>
            <label>
              Category:
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="bug">🐛 Technical Bug / Website Issue</option>
                <option value="clinic_correction">🏥 Clinic Listing / Hours Correction</option>
                <option value="order_issue">🛵 Delivery / Medication Order Support</option>
                <option value="partnership">🏪 Pet Store / Veterinary Partnership</option>
              </select>
            </label>
            <label>
              Your Name:
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Yossi Cohen" />
            </label>
            <label>
              Email Address:
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </label>
            <label>
              Description / Error Details:
              <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe what happened or what assistance you need..." />
            </label>
            {submitError && (
              <p className="support-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.75rem' }}>{submitError}</p>
            )}
            <button type="submit" className="btn-submit-support" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Send Support Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
