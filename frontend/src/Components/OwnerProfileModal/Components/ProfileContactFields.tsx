import React from 'react';
import { User as UserIcon, Mail, Phone, MapPin, HeartHandshake } from 'lucide-react';

interface ProfileContactFieldsProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  phone: string;
  setPhone: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  preferredVet: string;
  setPreferredVet: (v: string) => void;
}

export const ProfileContactFields: React.FC<ProfileContactFieldsProps> = ({
  name,
  setName,
  email,
  phone,
  setPhone,
  city,
  setCity,
  preferredVet,
  setPreferredVet,
}) => {
  return (
    <div className="owner-profile-fields-grid">
      <div className="form-group">
        <label>
          <UserIcon size={14} /> Full Name
        </label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>
          <Mail size={14} /> Email Address
        </label>
        <input
          type="email"
          className="form-input"
          value={email}
          disabled
          title="Email is linked to authentication"
        />
      </div>

      <div className="form-group">
        <label>
          <Phone size={14} /> Primary Phone (Emergency)
        </label>
        <input
          type="tel"
          className="form-input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>
          <MapPin size={14} /> Primary City / Region
        </label>
        <input
          type="text"
          className="form-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div className="form-group full-width">
        <label>
          <HeartHandshake size={14} /> Preferred Emergency Veterinary Clinic
        </label>
        <input
          type="text"
          className="form-input"
          value={preferredVet}
          onChange={(e) => setPreferredVet(e.target.value)}
        />
      </div>
    </div>
  );
};
