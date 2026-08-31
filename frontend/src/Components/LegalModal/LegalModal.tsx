import React, { useState } from 'react';
import './LegalModal.css';

interface LegalModalProps {
  initialTab?: 'privacy' | 'terms';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ initialTab = 'privacy', onClose }) => {
  const [tab, setTab] = useState<'privacy' | 'terms'>(initialTab);

  return (
    <div className="legal-modal-overlay" onClick={onClose}>
      <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="legal-modal-header">
          <div className="legal-tabs-switch">
            <button className={`btn-legal-tab ${tab === 'privacy' ? 'btn-legal-tab--active' : ''}`} onClick={() => setTab('privacy')}>
              🔒 Privacy Policy
            </button>
            <button className={`btn-legal-tab ${tab === 'terms' ? 'btn-legal-tab--active' : ''}`} onClick={() => setTab('terms')}>
              📜 Terms of Use
            </button>
          </div>
          <button className="btn-close-legal" onClick={onClose}>✕</button>
        </div>

        <div className="legal-modal-content">
          {tab === 'privacy' ? (
            <div className="legal-text-body">
              <h3>PetSOS Privacy Policy (GDPR & Data Protection)</h3>
              <p><strong>Last Updated: August 2026</strong></p>
              <p>PetSOS ("we", "us", or "our") respects your privacy and is dedicated to protecting the personal and medical data of pet owners and veterinary patients.</p>
              <h4>1. Information We Collect</h4>
              <ul>
                <li><strong>Geolocation:</strong> Exact GPS coordinates are gathered strictly to display nearby 24/7 ER clinics and dispatch DaaS couriers.</li>
                <li><strong>Pet Medical Records & Passports:</strong> Vaccine dates, prescriptions, OCR scanned receipts, and EMR data are stored securely and only accessible by authorized caregivers and attending clinics.</li>
                <li><strong>Camera & Photo Uploads:</strong> Photos processed through Gemini Vision are used solely for triage symptom detection and medical document parsing.</li>
              </ul>
              <h4>2. Third-Party Dispatches & Payment</h4>
              <p>For urgent medication deliveries, pickup and dropoff coordinates are transmitted to authorized DaaS providers (e.g., Wolt Drive) under strict fulfillment contracts.</p>
            </div>
          ) : (
            <div className="legal-text-body">
              <h3>PetSOS Platform Terms of Use</h3>
              <p><strong>Last Updated: August 2026</strong></p>
              <h4>1. Emergency Triage Disclaimer</h4>
              <p>PetSOS provides technological routing, capacity telemetry, and AI health suggestions. The AI assistant and triage tools do <strong>not</strong> substitute for professional veterinary diagnosis or immediate trauma intervention. If your pet experiences life-threatening distress, proceed directly to the nearest open 24/7 veterinary hospital.</p>
              <h4>2. Clinic & Store Directory Listings</h4>
              <p>Verified listings are maintained by licensed veterinary staff. Unverified community directory listings provide estimated contact details and require direct confirmation with the clinic.</p>
              <h4>3. Marketplace & Deliveries</h4>
              <p>Delivery estimates depend on local courier availability and merchant operating hours. Urgent medical deliveries are prioritized with specialized dispatch tags.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
