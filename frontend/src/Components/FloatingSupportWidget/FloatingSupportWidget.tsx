import React, { useState } from 'react';
import './FloatingSupportWidget.css';

interface FloatingSupportWidgetProps {
  onOpenAiChat: () => void;
  onOpenContactForm: (category?: string) => void;
  onOpenPrivacyPolicy: () => void;
}

export const FloatingSupportWidget: React.FC<FloatingSupportWidgetProps> = ({
  onOpenAiChat,
  onOpenContactForm,
  onOpenPrivacyPolicy,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="floating-support-container">
      {isOpen && (
        <div className="floating-support-menu">
          <div className="support-menu-header">
            <span>🐾 PetSOS Help & Support</span>
            <button className="btn-close-popover" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="support-menu-options">
            <button className="support-menu-btn" onClick={() => { setIsOpen(false); onOpenAiChat(); }}>
              <span className="menu-icon">🤖</span>
              <div><strong>Ask AI Vet Assistant</strong><small>Instant diet, dosage & symptom tips</small></div>
            </button>
            <button className="support-menu-btn" onClick={() => { setIsOpen(false); onOpenContactForm('bug'); }}>
              <span className="menu-icon">🐛</span>
              <div><strong>Report Bug / Technical Issue</strong><small>Direct line to engineering</small></div>
            </button>
            <button className="support-menu-btn" onClick={() => { setIsOpen(false); onOpenContactForm('clinic_correction'); }}>
              <span className="menu-icon">🏥</span>
              <div><strong>Clinic Listing Support</strong><small>Update details or emergency hours</small></div>
            </button>
            <button className="support-menu-btn" onClick={() => { setIsOpen(false); onOpenPrivacyPolicy(); }}>
              <span className="menu-icon">🔒</span>
              <div><strong>Privacy & Terms</strong><small>Cookie & data protection</small></div>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`floating-support-bubble ${isOpen ? 'floating-support-bubble--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open support options"
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};
