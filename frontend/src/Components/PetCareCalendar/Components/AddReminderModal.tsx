import React, { useState } from 'react';
import { X, Plus, Bell } from 'lucide-react';
import type { PetProfile } from '../../../schemas';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: PetProfile[];
  onAddReminder: (data: {
    petId: string;
    petName: string;
    title: string;
    type: string;
    dueDate: string;
    dueTime?: string;
    recurrence: string;
    notes?: string;
  }) => void;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  isOpen,
  onClose,
  pets,
  onAddReminder,
}) => {
  const [petId, setPetId] = useState(pets[0]?._id || pets[0]?.petId || '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'food' | 'vaccine' | 'medication' | 'grooming' | 'walking' | 'sitting' | 'custom'>('food');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('09:00 AM');
  const [recurrence, setRecurrence] = useState('monthly');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const activePet = pets.find((p) => (p._id || p.petId) === petId) || pets[0];
    onAddReminder({
      petId: activePet?._id || 'general',
      petName: activePet?.name || 'Pet',
      title: title.trim(),
      type,
      dueDate,
      dueTime,
      recurrence,
      notes,
    });
    onClose();
  };

  return (
    <div className="donation-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="donation-modal-card card add-reminder-card" onClick={(e) => e.stopPropagation()}>
        <div className="donation-modal-header">
          <div className="donation-header-title">
            <Bell size={20} color="#38bdf8" />
            <h3>Add Pet Care Reminder</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="add-reminder-form">
          <div className="form-group">
            <label>Pet</label>
            <select className="form-input" value={petId} onChange={(e) => setPetId(e.target.value)}>
              {pets.map((p) => (
                <option key={p._id || p.petId} value={p._id || p.petId}>
                  🐾 {p.name} ({p.species})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Reminder Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Buy Royal Canin 14kg, NexGard Chewable..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="food">🍖 Food & Kibble Refill</option>
                <option value="vaccine">💉 Vaccine Booster</option>
                <option value="medication">💊 Medication / Flea & Tick</option>
                <option value="grooming">✂️ Grooming & Bath</option>
                <option value="walking">🐕 Dog Walking Schedule</option>
                <option value="custom">🔔 Custom Care Task</option>
              </select>
            </div>
            <div className="form-group">
              <label>Repeat / Recurrence</label>
              <select className="form-input" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                <option value="once">Once (No repeat)</option>
                <option value="monthly">Monthly (Every 30 days)</option>
                <option value="yearly">Yearly (Annual booster)</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Due Time</label>
              <input type="text" className="form-input" placeholder="09:00 AM" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              rows={2}
              className="form-input"
              placeholder="Special dose, store brand, or instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="donation-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary"><Plus size={16} /> Save Reminder</button>
          </div>
        </form>
      </div>
    </div>
  );
};
