import React, { useState } from 'react';
import { Habit } from '../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
}

const EMOJIS = ["💧", "🏃", "📚", "🧘", "💊", "💤", "🍎", "💪", "💻", "🎨", "🧹", "💰"];
const COLORS = ["#3EA5FF", "#FF5C5C", "#4CAF50", "#FFC107", "#9C27B0", "#FF9800"];

const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [reminderTime, setReminderTime] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ 
      name, 
      icon: selectedEmoji, 
      color: selectedColor,
      reminderTime: reminderTime || undefined
    });
    setName('');
    setReminderTime('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface w-full max-w-md rounded-3xl p-6 shadow-2xl border border-secondary animate-slide-up">
        <h2 className="text-xl font-bold text-white mb-6 text-center">عادة جديدة</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-muted text-sm mb-2">اسم العادة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: شرب الماء"
              className="w-full bg-background border border-secondary rounded-xl p-4 text-white placeholder-gray-600 focus:border-primary focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="mb-4">
             <label className="block text-muted text-sm mb-2">وقت التذكير (اختياري)</label>
             <div className="relative">
               <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full bg-background border border-secondary rounded-xl p-4 text-white placeholder-gray-600 focus:border-primary focus:outline-none transition-colors appearance-none"
                style={{ colorScheme: 'dark' }}
               />
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                 ⏰
               </div>
             </div>
          </div>

          <div className="mb-4">
            <label className="block text-muted text-sm mb-2">الأيقونة</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`min-w-[48px] h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${selectedEmoji === emoji ? 'bg-secondary border-2 border-primary' : 'bg-background hover:bg-secondary'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-muted text-sm mb-2">اللون</label>
            <div className="flex gap-4 justify-center">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl bg-background text-muted font-bold hover:bg-secondary transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-4 rounded-xl bg-primary text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitModal;