import React, { useRef, useEffect } from 'react';
import { DayData } from '../types';

interface CalendarStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const CalendarStrip: React.FC<CalendarStripProps> = ({ selectedDate, onSelectDate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Generate last 15 days + next 2 days
  const generateDays = (): DayData[] => {
    const days: DayData[] = [];
    const today = new Date();
    
    for (let i = -14; i <= 2; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      const dateStr = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const dayName = d.toLocaleDateString('ar-EG', { weekday: 'short' });
      
      days.push({
        date: dateStr,
        dayName,
        dayNumber: d.getDate(),
        isToday: i === 0
      });
    }
    return days;
  };

  const days = generateDays();

  // Scroll to selected date on mount
  useEffect(() => {
    if (scrollRef.current) {
      // Simple logic to scroll to the end roughly where 'today' is
      scrollRef.current.scrollLeft = -1000; 
    }
  }, []);

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-end mb-4 px-1">
        <div>
          <h2 className="text-muted text-sm font-medium">اليوم</h2>
          <h1 className="text-2xl font-bold text-white">
            {new Date(selectedDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
          </h1>
        </div>
        <div className="text-primary text-sm font-bold bg-surface px-3 py-1 rounded-full">
           {new Date().toLocaleDateString('en-CA') === selectedDate ? 'اليوم' : new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long' })}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto no-scrollbar gap-3 pb-2 snap-x"
        style={{ scrollBehavior: 'smooth' }}
      >
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`
                flex flex-col items-center justify-center min-w-[60px] h-[80px] rounded-2xl transition-all duration-300 snap-center shrink-0
                ${isSelected ? 'bg-primary text-white shadow-[0_4px_20px_rgba(62,165,255,0.4)] transform scale-105' : 'bg-surface text-muted hover:bg-secondary'}
                ${day.isToday && !isSelected ? 'border border-primary text-primary' : ''}
              `}
            >
              <span className="text-xs font-medium mb-1 opacity-80">{day.dayName}</span>
              <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-white'}`}>{day.dayNumber}</span>
              {day.isToday && <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-primary'}`}></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarStrip;