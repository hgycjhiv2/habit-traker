import React, { useState } from 'react';
import { Task } from '../types';

interface PlannerViewProps {
  date: string;
  tasks: Task[];
  onAddTask: (title: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const PlannerView: React.FC<PlannerViewProps> = ({ date, tasks, onAddTask, onToggleTask, onDeleteTask }) => {
  const [newTask, setNewTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    onAddTask(newTask);
    setNewTask('');
  };

  return (
    <div className="animate-fade-in pb-24">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">المهام اليومية</h2>
        <p className="text-muted text-sm">
          {new Date(date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 relative group">
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <span className="text-primary text-xl">✍️</span>
        </div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="أضف مهمة جديدة..."
          className="w-full bg-surface border border-secondary rounded-2xl py-4 pr-12 pl-12 text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
        />
        <button 
          type="submit"
          disabled={!newTask.trim()}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-secondary rounded-3xl opacity-50">
            <span className="text-4xl mb-2">📝</span>
            <p className="text-muted">لا توجد مهام لهذا اليوم</p>
          </div>
        )}

        {tasks.map(task => (
          <div 
            key={task.id}
            className={`
              group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300
              ${task.completed ? 'bg-surface/30 border-secondary/50' : 'bg-surface border-secondary hover:border-primary/30'}
            `}
          >
            <button
              onClick={() => onToggleTask(task.id)}
              className={`
                shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${task.completed ? 'bg-primary border-primary scale-110' : 'border-muted hover:border-primary'}
              `}
            >
              {task.completed && <svg className="animate-fade-in" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
            
            <span className={`flex-1 text-lg transition-all duration-300 ${task.completed ? 'text-muted line-through' : 'text-white'}`}>
              {task.title}
            </span>

            <button
              onClick={() => onDeleteTask(task.id)}
              className="shrink-0 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-1 1-1h6c1 0 1 1 1 1v2"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlannerView;