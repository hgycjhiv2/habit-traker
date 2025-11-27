import React, { useState, useEffect } from 'react';
import { Habit, ViewState, Task } from './types';
import CalendarStrip from './components/CalendarStrip';
import HabitModal from './components/HabitModal';
import StatsView from './components/StatsView';
import PlannerView from './components/PlannerView';
import { getHabitInsights } from './services/geminiService';

const STORAGE_KEY_HABITS = 'habitflow_rtl_data';
const STORAGE_KEY_TASKS = 'habitflow_rtl_tasks';

const App: React.FC = () => {
  // State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem(STORAGE_KEY_HABITS);
    const savedTasks = localStorage.getItem(STORAGE_KEY_TASKS);
    
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (e) {
        console.error("Failed to parse habits", e);
      }
    } else {
      // Default dummy data
      setHabits([
        { id: '1', name: 'شرب الماء', icon: '💧', color: '#3EA5FF', completedDates: [], createdAt: new Date().toISOString(), reminderTime: '09:00' },
        { id: '2', name: 'قراءة', icon: '📚', color: '#FFC107', completedDates: [], createdAt: new Date().toISOString() },
      ]);
    }

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }

    // Request notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Notification Checker
  useEffect(() => {
    const checkReminders = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      // Format: HH:MM (24-hour)
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); 
      const today = now.toLocaleDateString('en-CA');

      habits.forEach(habit => {
        if (habit.reminderTime === currentTime) {
          // Only notify if not already completed today
          if (!habit.completedDates.includes(today)) {
             // Basic check to prevent spamming notifications in the same minute: 
             // In a real app we would track "lastNotified" timestamp. 
             // For this simple version, standard browser throttling usually handles duplicate overlapping calls,
             // but strictly we rely on the minute tick interval.
             new Notification(`تذكير: ${habit.name}`, {
               body: `حان الوقت لممارسة عادتك ${habit.icon}`,
               icon: '/icon.png', // Fallback
               tag: `${habit.id}-${today}` // Unique tag prevents duplicate notifications for same habit same day
             });
          }
        }
      });
    };

    // Check every 60 seconds. 
    // To align with the clock minute change, we could calculate delay, but strict interval is sufficient for MVP.
    const intervalId = setInterval(checkReminders, 60000);
    
    // Initial check immediately (optional, or just wait for next tick)
    // checkReminders();

    return () => clearInterval(intervalId);
  }, [habits]);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  }, [tasks]);

  // Habit Functions
  const addHabit = (habitData: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    
    // Ask for permission if adding a habit with reminder
    if (newHabit.reminderTime && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const deleteHabit = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه العادة؟')) {
      setHabits(prev => prev.filter(h => h.id !== id));
    }
  };

  const toggleHabit = (id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isCompleted = h.completedDates.includes(date);
      let newDates;
      if (isCompleted) {
        newDates = h.completedDates.filter(d => d !== date);
      } else {
        newDates = [...h.completedDates, date];
      }
      return { ...h, completedDates: newDates };
    }));
  };

  // Task Functions
  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      date: selectedDate,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleGenerateInsight = async () => {
    setIsLoadingAi(true);
    const insight = await getHabitInsights(habits);
    setAiInsight(insight);
    setIsLoadingAi(false);
  };

  // Get tasks for selected date
  const todaysTasks = tasks.filter(t => t.date === selectedDate);

  // SVG Icons
  const HomeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
  
  const ChartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
  );

  const PlannerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
  );

  const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  );

  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );
  
  const TrashIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-1 1-1h6c1 0 1 1 1 1v2"/></svg>
  );

  return (
    <div className="min-h-screen bg-background text-text font-sans pb-24 relative overflow-hidden selection:bg-primary selection:text-white">
      {/* Background Decor */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <main className="max-w-md mx-auto px-5 pt-6 relative z-10">
        
        {/* Header Area: Show for Home and Planner */}
        {(view === ViewState.HOME || view === ViewState.PLANNER) && (
          <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        )}

        {/* Content */}
        {view === ViewState.HOME && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {habits.length === 0 && (
              <div className="text-center py-20 text-muted opacity-50">
                <p>لا توجد عادات بعد</p>
                <p className="text-sm">أضف عادتك الأولى لتبدأ</p>
              </div>
            )}
            
            {habits.map(habit => {
              const isCompleted = habit.completedDates.includes(selectedDate);
              
              return (
                <div 
                  key={habit.id} 
                  className={`
                    group relative flex items-center justify-between p-4 rounded-3xl transition-all duration-300
                    ${isCompleted ? 'bg-surface/50 border border-primary/30' : 'bg-surface border border-transparent'}
                    hover:border-primary/20 hover:translate-y-[-2px]
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-background border border-secondary transition-transform duration-500 ${isCompleted ? 'scale-110' : ''}`}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg transition-colors ${isCompleted ? 'text-primary' : 'text-white'}`}>{habit.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: habit.color}}></span>
                            يومي
                        </span>
                        {habit.reminderTime && (
                           <span className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded-md">
                               ⏰ {habit.reminderTime}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteHabit(habit.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-danger transition-opacity"
                        aria-label="Delete"
                     >
                        <TrashIcon />
                     </button>
                     
                    <button
                      onClick={() => toggleHabit(habit.id, selectedDate)}
                      className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                        ${isCompleted ? 'bg-primary text-white shadow-[0_0_15px_rgba(62,165,255,0.5)] rotate-0' : 'bg-secondary text-transparent hover:bg-secondary/80 rotate-180'}
                      `}
                    >
                      <CheckIcon />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {/* Spacer for FAB */}
            <div className="h-20" />
          </div>
        )}

        {view === ViewState.PLANNER && (
          <PlannerView 
            date={selectedDate}
            tasks={todaysTasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
          />
        )}

        {view === ViewState.STATS && (
          <StatsView 
            habits={habits} 
            aiInsight={aiInsight}
            onGenerateInsight={handleGenerateInsight}
            isLoadingAi={isLoadingAi}
          />
        )}
      </main>

      {/* Floating Action Button - Only on Home */}
      {view === ViewState.HOME && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-24 left-6 w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_20px_rgba(62,165,255,0.4)] flex items-center justify-center hover:scale-110 transition-transform z-30 active:scale-95"
        >
          <PlusIcon />
        </button>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-secondary p-4 pb-6 z-40">
        <div className="max-w-md mx-auto flex justify-between px-6 items-center">
          <button 
            onClick={() => setView(ViewState.HOME)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${view === ViewState.HOME ? 'text-primary' : 'text-muted hover:text-white'}`}
          >
            <div className={`p-2 rounded-xl ${view === ViewState.HOME ? 'bg-primary/20' : ''}`}>
               <HomeIcon />
            </div>
            <span className="text-[10px] font-medium">الرئيسية</span>
          </button>

          <button 
            onClick={() => setView(ViewState.PLANNER)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${view === ViewState.PLANNER ? 'text-primary' : 'text-muted hover:text-white'}`}
          >
             <div className={`p-2 rounded-xl ${view === ViewState.PLANNER ? 'bg-primary/20' : ''}`}>
               <PlannerIcon />
            </div>
            <span className="text-[10px] font-medium">مهامي</span>
          </button>

          <button 
            onClick={() => setView(ViewState.STATS)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${view === ViewState.STATS ? 'text-primary' : 'text-muted hover:text-white'}`}
          >
             <div className={`p-2 rounded-xl ${view === ViewState.STATS ? 'bg-primary/20' : ''}`}>
               <ChartIcon />
            </div>
            <span className="text-[10px] font-medium">إحصائيات</span>
          </button>
        </div>
      </div>

      <HabitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={addHabit}
      />
    </div>
  );
};

export default App;