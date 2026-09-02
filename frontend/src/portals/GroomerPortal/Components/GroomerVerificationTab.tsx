import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const GroomerVerificationTab: React.FC = () => {
  return (
    <div className="groomer-verification-tab">
      <div className="verification-hero-card">
        <div className="verified-shield-icon">
          <ShieldCheck size={42} color="#10b981" />
        </div>
        <div>
          <h2>Official Certified Pet Groomer Status</h2>
          <p>
            Your salon profile is verified by PetSOS Quality & Safety Board. Gold badges are displayed across user search listings.
          </p>
          <div className="badge-checklist">
            <div className="check-item"><CheckCircle2 size={16} color="#10b981" /> Professional Grooming License Verified</div>
            <div className="check-item"><CheckCircle2 size={16} color="#10b981" /> Pet First Aid & Safety Clearance</div>
            <div className="check-item"><CheckCircle2 size={16} color="#10b981" /> Salon Commercial Insurance on File</div>
            <div className="check-item"><CheckCircle2 size={16} color="#10b981" /> Itemized VAT Compliant Invoicing Enabled</div>
          </div>
        </div>
      </div>
    </div>
  );
};
