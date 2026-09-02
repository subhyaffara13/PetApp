import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '11:45 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:15 PM',
];

interface BookingDateTimeSlotsProps {
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  selectedSlot: string;
  setSelectedSlot: (s: string) => void;
}

export const BookingDateTimeSlots: React.FC<BookingDateTimeSlotsProps> = ({
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
}) => {
  // Generate next 7 days for quick day chips
  const today = new Date();
  const nextDays = Array.from({ length: 5 }).map((_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() + idx + 1);
    const iso = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { iso, dayName, dayNum };
  });

  return (
    <div className="booking-datetime-group">
      <label className="booking-field-label">
        <CalendarIcon size={14} /> Choose Date & Time
      </label>

      <div className="booking-quick-days-row">
        {nextDays.map((d) => (
          <button
            key={d.iso}
            type="button"
            className={`day-chip ${selectedDate === d.iso ? 'active' : ''}`}
            onClick={() => setSelectedDate(d.iso)}
          >
            <span className="chip-day-name">{d.dayName}</span>
            <strong className="chip-day-num">{d.dayNum}</strong>
          </button>
        ))}
      </div>

      <div className="booking-date-input-row">
        <input
          type="date"
          className="form-input date-picker-field"
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <div className="booking-slots-grid">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot}
            type="button"
            className={`slot-chip ${selectedSlot === slot ? 'active' : ''}`}
            onClick={() => setSelectedSlot(slot)}
          >
            <Clock size={12} /> {slot}
          </button>
        ))}
      </div>
    </div>
  );
};
