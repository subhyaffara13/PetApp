import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment, Reminder } from '../../../schemas';

interface MonthCalendarGridProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  selectedDate: string;
  onSelectDate: (d: string) => void;
  appointments: Appointment[];
  reminders: Reminder[];
}

export const MonthCalendarGrid: React.FC<MonthCalendarGridProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  selectedDate,
  onSelectDate,
  appointments,
  reminders,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: daysInMonth }).map((_, i) => i + 1);
  const blanks = Array.from({ length: firstDayIndex }).map((_, i) => i);

  return (
    <div className="month-calendar-wrapper">
      <div className="calendar-month-header">
        <button type="button" className="btn-month-nav" onClick={onPrevMonth}>
          <ChevronLeft size={16} />
        </button>
        <h4 className="month-heading">{monthName}</h4>
        <button type="button" className="btn-month-nav" onClick={onNextMonth}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="calendar-weekdays-row">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <span key={d} className="weekday-col">{d}</span>
        ))}
      </div>

      <div className="calendar-days-grid">
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="calendar-day-cell blank" />
        ))}

        {daysArray.map((dayNum) => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          const dayAppts = appointments.filter((a) => a.appointmentDate === dateStr);
          const dayReminders = reminders.filter((r) => r.dueDate === dateStr);
          const totalEvents = dayAppts.length + dayReminders.length;

          return (
            <div
              key={dateStr}
              className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => onSelectDate(dateStr)}
            >
              <span className="day-number">{dayNum}</span>

              {totalEvents > 0 && (
                <div className="day-badges-container">
                  {dayAppts.map((a) => (
                    <span
                      key={a._id || a.timeSlot}
                      className="event-dot"
                      style={{ background: a.petColor || '#f97316' }}
                      title={`${a.petName}: ${a.serviceName}`}
                    />
                  ))}
                  {dayReminders.map((r) => (
                    <span
                      key={r._id || r.title}
                      className={`event-dot reminder-dot ${r.isCompleted ? 'completed' : ''}`}
                      style={{ background: r.petColor || '#38bdf8' }}
                      title={`${r.petName}: ${r.title}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
