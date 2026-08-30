import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

const COOKIE_STORAGE_KEY = 'petsos_cookie_consent_v1';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

interface CookieBannerProps {
  onOpenPrivacyPolicy: () => void;
  onOpenTerms: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacyPolicy, onOpenTerms }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!saved) setIsVisible(true);
  }, []);

  const saveConsent = (consent: CookieConsent) => {
    localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleAcceptAll = () => saveConsent({ essential: true, analytics: true, marketing: true, timestamp: new Date().toISOString() });
  const handleRejectNone = () => saveConsent({ essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString() });
  const handleSavePartial = () => saveConsent({ essential: true, analytics, marketing, timestamp: new Date().toISOString() });

  if (!isVisible) return null;

  return (
    <div className="cookie-banner-overlay">
      <div className="cookie-banner-card">
        <div className="cookie-banner-header">
          <span className="cookie-icon">🍪</span>
          <h4>Your Privacy & Cookie Choices</h4>
        </div>
        <p className="cookie-banner-text">
          We use cookies to provide critical emergency routing, secure pet medical passport access, and optional analytics to improve response times. Read our{' '}
          <button type="button" className="btn-link-legal" onClick={onOpenPrivacyPolicy}>Privacy Policy</button> &{' '}
          <button type="button" className="btn-link-legal" onClick={onOpenTerms}>Terms of Use</button>.
        </p>

        {showCustom ? (
          <div className="cookie-custom-section">
            <label className="cookie-toggle-row">
              <input type="checkbox" checked disabled />
              <span><strong>Strictly Necessary</strong> (Emergency maps, auth & cart state)</span>
            </label>
            <label className="cookie-toggle-row">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
              <span><strong>Performance & Analytics</strong> (Load speed & triage telemetry)</span>
            </label>
            <label className="cookie-toggle-row">
              <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
              <span><strong>Personalization</strong> (Relevant pet care tips & local clinic notices)</span>
            </label>
            <div className="cookie-actions-row">
              <button className="btn-cookie btn-cookie--primary" onClick={handleSavePartial}>Save My Preferences</button>
              <button className="btn-cookie btn-cookie--ghost" onClick={() => setShowCustom(false)}>Back</button>
            </div>
          </div>
        ) : (
          <div className="cookie-actions-row">
            <button className="btn-cookie btn-cookie--primary" onClick={handleAcceptAll}>Accept All (Recommended)</button>
            <button className="btn-cookie btn-cookie--secondary" onClick={handleRejectNone}>Reject Non-Essential (None)</button>
            <button className="btn-cookie btn-cookie--ghost" onClick={() => setShowCustom(true)}>Customize (Part)</button>
          </div>
        )}
      </div>
    </div>
  );
};
