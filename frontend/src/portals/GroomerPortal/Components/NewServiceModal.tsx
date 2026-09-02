import React, { useState } from 'react';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    price: number;
    durationMinutes: number;
    description: string;
  }) => void;
}

export const NewServiceModal: React.FC<NewServiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(100);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [category, setCategory] = useState('full_groom');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, category, price, durationMinutes, description });
    setName('');
    setDescription('');
  };

  return (
    <div className="portal-modal-backdrop" onClick={onClose}>
      <div className="portal-modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Add New Grooming Service</h3>
        <form onSubmit={handleSubmit} className="portal-form">
          <label>
            Service Name
            <input
              type="text"
              required
              placeholder="e.g. Deep De-Shedding & Blueberry Facial"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <div className="form-row-2">
            <label>
              Price (₪)
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </label>
            <label>
              Duration (Mins)
              <input
                type="number"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </label>
          </div>

          <label>
            Category
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="full_groom">Full Breed Groom & Styling</option>
              <option value="bath_brush">Bath, Blowdry & De-Shedding</option>
              <option value="specialty">Medical / Antiparasitic Bath</option>
              <option value="hygiene">Nails & Ears Hygiene</option>
              <option value="teeth_ears">Dental & Breath Polish</option>
            </select>
          </label>

          <label>
            Description
            <textarea
              rows={3}
              placeholder="Details of what is included in this package..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="portal-modal-actions">
            <button type="submit" className="btn-submit-portal">
              Save Service
            </button>
            <button
              type="button"
              className="btn-cancel-portal"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
