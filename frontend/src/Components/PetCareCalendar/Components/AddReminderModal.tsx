import React, { useState } from 'react';
import { Plus, Bell } from 'lucide-react';
import type { PetProfile } from '../../../schemas';
import { Modal, Input, Select, Textarea, Button } from '../../UI';

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

  const modalTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Bell size={20} color="#38bdf8" />
      <span>Add Pet Care Reminder</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="500px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Select
          label="Pet"
          value={petId}
          onChange={(e) => setPetId(e.target.value)}
        >
          {pets.map((p) => (
            <option key={p._id || p.petId} value={p._id || p.petId}>
              🐾 {p.name} ({p.species})
            </option>
          ))}
        </Select>

        <Input
          label="Reminder Title"
          placeholder="e.g. Buy Royal Canin 14kg, NexGard Chewable..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <Select
            label="Category"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="food">🍖 Food & Kibble Refill</option>
            <option value="vaccine">💉 Vaccine Booster</option>
            <option value="medication">💊 Medication / Flea & Tick</option>
            <option value="grooming">✂️ Grooming & Bath</option>
            <option value="walking">🐕 Dog Walking Schedule</option>
            <option value="custom">🔔 Custom Care Task</option>
          </Select>

          <Select
            label="Repeat / Recurrence"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
          >
            <option value="once">Once (No repeat)</option>
            <option value="monthly">Monthly (Every 30 days)</option>
            <option value="yearly">Yearly (Annual booster)</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </Select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Input
            label="Due Time"
            placeholder="09:00 AM"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>

        <Textarea
          label="Notes (Optional)"
          rows={2}
          placeholder="Special dose, store brand, or instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" leftIcon={<Plus size={16} />}>
            Save Reminder
          </Button>
        </div>
      </form>
    </Modal>
  );
};
